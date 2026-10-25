import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Circle, DailyCheckin, Task, TaskDraft, TaskFrequency, TaskLog, ThemeId, UserProfile } from './types';
import { addDays, dayKey } from './lib/dates';
import {
  calculateXp, continuesStreak, FULL_DAY_BONUS, isAssignedTo, isDoneNow, isForToday, isOverdue, levelForXp, taskTitle,
} from './lib/tasks';
import { completionMoment, creationMoment, STREAK_MILESTONES } from './lib/messages';
import { applyTheme, readStoredTheme } from './lib/themes';
import { haptic, soundEffects } from './utils/audio';
import CelebrationProvider, { useCelebrate } from './components/celebrate/CelebrationProvider';
import LoginScreen from './components/LoginScreen';
import CircleManagement from './components/CircleManagement';
import AppShell, { Tab } from './components/AppShell';
import TaskSheet from './components/TaskSheet';
import TodayView from './components/views/TodayView';
import PlanView from './components/views/PlanView';
import FamilyView from './components/views/FamilyView';
import MeView from './components/views/MeView';

const REMINDERS_KEY = 'solrise_reminders';
const LOG_WINDOW_DAYS = 35;

const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

// Firestore rejects undefined values
const clean = <T extends object>(obj: T) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v === undefined ? null : v])) as T;

const readReminders = () => {
  try {
    return localStorage.getItem(REMINDERS_KEY) === '1';
  } catch {
    return false;
  }
};

function LoadingScreen() {
  return (
    <div className="min-h-screen ambient flex flex-col items-center justify-center gap-5">
      <div className="relative w-24 h-14 overflow-hidden">
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-b from-[#FFE58A] to-[#FF9A3D] shadow-[0_0_40px_10px_rgba(255,180,80,0.45)]"
          initial={{ y: 70 }}
          animate={{ y: [70, 12, 70] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-line" />
      </div>
      <p className="font-display text-lg text-muted">Your day is rising…</p>
    </div>
  );
}

interface SheetState {
  task?: Task;
  preset?: { title?: string; frequency?: TaskFrequency };
}

function SolRise() {
  const celebrate = useCelebrate();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [circle, setCircle] = useState<Circle | null>(null);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('today');
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [theme, setTheme] = useState<ThemeId>(readStoredTheme);
  const [remindersOn, setRemindersOn] = useState(readReminders);
  const greetedRef = useRef(false);

  useEffect(() => applyTheme(theme), [theme]);

  // Auth
  useEffect(() => onAuthStateChanged(auth, user => {
    setCurrentUser(user);
    if (!user) {
      setUserProfile(null);
      setCircle(null);
      setMembers([]);
      setTasks([]);
      setLogs([]);
      setLoading(false);
    }
  }), []);

  // Profile (with retries to ride out the auth token race right after sign-in)
  useEffect(() => {
    if (!currentUser) return;
    let unsubscribe: (() => void) | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let retries = 0;

    const subscribe = () => {
      unsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), snap => {
        if (snap.exists()) setUserProfile(snap.data() as UserProfile);
        setLoading(false);
      }, error => {
        console.error('Error listening to user profile:', error);
        if (retries < 3) {
          retries++;
          setLoading(true);
          retryTimeout = setTimeout(subscribe, 1500);
        } else {
          setLoading(false);
        }
      });
    };
    subscribe();
    return () => {
      unsubscribe?.();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [currentUser]);

  // Sync theme chosen on another device
  useEffect(() => {
    if (userProfile?.theme && userProfile.theme !== theme) setTheme(userProfile.theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.theme]);

  // Circle, members, tasks and recent logs
  useEffect(() => {
    const circleId = userProfile?.circleId;
    if (!circleId) {
      setCircle(null);
      setMembers([]);
      setTasks([]);
      setLogs([]);
      return;
    }
    const since = addDays(new Date(), -LOG_WINDOW_DAYS).toISOString();
    const unsubs = [
      onSnapshot(doc(db, 'circles', circleId), snap => snap.exists() && setCircle(snap.data() as Circle)),
      onSnapshot(query(collection(db, 'users'), where('circleId', '==', circleId)), snap =>
        setMembers(snap.docs.map(d => d.data() as UserProfile))),
      onSnapshot(collection(db, 'circles', circleId, 'tasks'), snap =>
        setTasks(snap.docs.map(d => d.data() as Task))),
      onSnapshot(
        query(collection(db, 'circles', circleId, 'logs'), where('completedAt', '>=', since), orderBy('completedAt', 'desc'), limit(400)),
        snap => setLogs(snap.docs.map(d => d.data() as TaskLog)),
      ),
    ];
    return () => unsubs.forEach(u => u());
  }, [userProfile?.circleId]);

  // A warm hello once per session that nudges the streak along
  useEffect(() => {
    if (greetedRef.current || !userProfile?.circleId || tasks.length === 0) return;
    const today = dayKey();
    const yesterday = dayKey(addDays(new Date(), -1));
    const streak = userProfile.dayStreak || 0;
    const timer = setTimeout(() => {
      greetedRef.current = true;
      if (userProfile.lastActiveDate === yesterday && streak > 0) {
        celebrate.moment({ emoji: '🔥', title: `Keep your ${streak}-day streak alive`, body: 'One small win today is all it takes.', tone: 'info' });
      } else if (userProfile.lastActiveDate && userProfile.lastActiveDate < yesterday) {
        celebrate.moment({ emoji: '🌅', title: 'Welcome back', body: 'No guilt, no catching up. Today is a fresh start.', tone: 'info' });
      } else if (userProfile.lastActiveDate !== today && new Date().getHours() < 12) {
        celebrate.moment({ emoji: '☀️', title: 'A new day is rising', body: 'Pick one small thing and begin.', tone: 'info' });
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [userProfile, tasks.length, celebrate]);

  // Reminders at each task's time, while the app is open
  const alerted = useRef(new Set<string>());
  useEffect(() => {
    if (!remindersOn || !userProfile?.circleId) return;
    const check = () => {
      const now = new Date();
      const hhmm = now.toTimeString().slice(0, 5);
      tasks.forEach(task => {
        if (task.timeOfDay !== hhmm || !isAssignedTo(task, userProfile.uid) || !isForToday(task, now) || isDoneNow(task, now)) return;
        const key = `${task.id}-${dayKey(now)}-${hhmm}`;
        if (alerted.current.has(key)) return;
        alerted.current.add(key);
        soundEffects.playAlert();
        celebrate.moment({ emoji: '⏰', title: `Time for: ${taskTitle(task)}`, body: 'Just begin. Two minutes is enough to start.', tone: 'info' });
        if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
          new Notification('SolRise', { body: `Time for: ${taskTitle(task)}` });
        }
      });
    };
    check();
    const interval = setInterval(check, 20_000);
    return () => clearInterval(interval);
  }, [tasks, remindersOn, userProfile?.circleId, userProfile?.uid, celebrate]);

  const toggleReminders = async () => {
    const next = !remindersOn;
    if (next && 'Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch {
        // permission prompt unsupported
      }
    }
    setRemindersOn(next);
    try {
      localStorage.setItem(REMINDERS_KEY, next ? '1' : '0');
    } catch {
      // storage blocked
    }
    celebrate.moment(next
      ? { emoji: '🔔', title: 'Reminders on', body: 'We will give you a gentle nudge at each task time.', tone: 'info' }
      : { emoji: '🔕', title: 'Reminders off', body: 'Quiet mode. Your list will be here when you are.', tone: 'info' });
  };

  const updateProfile = useCallback(async (patch: Partial<UserProfile>) => {
    if (!userProfile) return;
    try {
      await updateDoc(doc(db, 'users', userProfile.uid), clean(patch));
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  }, [userProfile]);

  const changeTheme = (next: ThemeId) => {
    setTheme(next);
    soundEffects.playTap();
    updateProfile({ theme: next });
  };

  const saveCheckin = (patch: Partial<DailyCheckin>) => {
    if (!userProfile) return;
    const today = dayKey();
    const base = userProfile.checkin?.date === today ? userProfile.checkin : { date: today };
    updateProfile({ checkin: clean({ ...base, ...patch, date: today }) });
    if (patch.intention) {
      celebrate.moment({ emoji: '🎯', title: 'Focus set', body: 'We will keep it right here, in view, all day.' });
    } else if (patch.reflection) {
      celebrate.moment({ emoji: '🌙', title: 'Noted, with care', body: 'Thank you for checking in with yourself today.' });
    }
  };

  const completeTask = async (task: Task) => {
    if (!userProfile?.circleId) return;
    const me = userProfile;
    const now = new Date();
    const today = dayKey(now);
    const yesterday = dayKey(addDays(now, -1));
    const reward = task.xpReward || 10;

    const myToday = tasks.filter(t => isAssignedTo(t, me.uid) && isForToday(t, now));
    const wasOnToday = myToday.some(t => t.id === task.id);
    const remaining = myToday.filter(t => t.id !== task.id && !isDoneNow(t, now)).length;
    const dayComplete = wasOnToday && remaining === 0;

    const taskStreak = continuesStreak(task, now) ? (task.streak || 0) + 1 : 1;
    const isFirstToday = me.lastActiveDate !== today;
    const dayStreak = me.lastActiveDate === today
      ? me.dayStreak || 1
      : me.lastActiveDate === yesterday ? (me.dayStreak || 0) + 1 : 1;
    const bonus = dayComplete && me.bonusDate !== today ? FULL_DAY_BONUS : 0;
    const xp = (me.xp || 0) + reward + bonus;
    const oldLevel = levelForXp(me.xp || 0);
    const level = levelForXp(xp);
    const activeDays = Array.from(new Set([...(me.activeDays || []), today])).sort().slice(-60);

    const batch = writeBatch(db);
    batch.update(doc(db, 'users', me.uid), clean({
      xp,
      level,
      tasksCompleted: (me.tasksCompleted || 0) + 1,
      dayStreak,
      bestStreak: Math.max(me.bestStreak || 0, dayStreak),
      lastActiveDate: today,
      activeDays,
      bonusDate: bonus ? today : me.bonusDate,
    }));
    batch.update(doc(db, 'circles', me.circleId!, 'tasks', task.id), {
      status: 'Completed',
      streak: taskStreak,
      lastCompletedAt: now.toISOString(),
      lastCompletedBy: me.uid,
      prevCompletedAt: task.lastCompletedAt ?? null,
      prevStreak: task.streak || 0,
      completionCount: (task.completionCount || 0) + 1,
    });
    const logId = newId('log');
    batch.set(doc(db, 'circles', me.circleId!, 'logs', logId), {
      id: logId,
      taskId: task.id,
      taskTitle: taskTitle(task),
      taskCategory: task.category,
      completedBy: me.uid,
      completedByName: me.displayName,
      completedByEmoji: me.avatarEmoji,
      xpAwarded: reward,
      completedAt: now.toISOString(),
    } satisfies TaskLog);

    try {
      await batch.commit();
    } catch (err) {
      console.error('Error completing task:', err);
      celebrate.moment({ emoji: '😕', title: 'That did not save', body: 'Check your connection and try again.', tone: 'info' });
      return;
    }

    // Big moments queue up as full-screen overlays; otherwise a personal note
    const hitMilestone = dayStreak !== (me.dayStreak || 0) && STREAK_MILESTONES.includes(dayStreak);
    if (dayComplete) {
      soundEffects.playDayComplete();
      haptic([20, 60, 20, 60, 40]);
      const xpToday = logs.filter(l => l.completedBy === me.uid && dayKey(new Date(l.completedAt)) === today)
        .reduce((s, l) => s + l.xpAwarded, 0) + reward + bonus;
      celebrate.overlay({
        kind: 'day',
        done: myToday.length,
        xp: xpToday,
        streak: dayStreak,
        onReflect: reflection => saveCheckin({ reflection }),
      });
    }
    if (hitMilestone) {
      if (!dayComplete) soundEffects.playStreak();
      celebrate.overlay({ kind: 'streak', days: dayStreak });
    }
    if (level > oldLevel) {
      if (!dayComplete && !hitMilestone) soundEffects.playLevelUp();
      celebrate.overlay({ kind: 'level', level });
    }
    if (!dayComplete) {
      celebrate.moment(completionMoment({
        task,
        now,
        remainingToday: wasOnToday ? remaining : -1,
        isFirstToday,
        wasOverdue: isOverdue(task, now),
        taskStreak,
      }));
    }
  };

  const uncompleteTask = async (task: Task) => {
    if (!userProfile?.circleId) return;
    const me = userProfile;
    const reward = task.xpReward || 10;
    const byMe = task.lastCompletedBy === me.uid;

    const batch = writeBatch(db);
    batch.update(doc(db, 'circles', me.circleId!, 'tasks', task.id), {
      status: 'Pending',
      lastCompletedAt: task.prevCompletedAt ?? null,
      lastCompletedBy: null,
      streak: task.prevStreak ?? 0,
      completionCount: Math.max(0, (task.completionCount || 1) - 1),
    });
    if (byMe) {
      const xp = Math.max(0, (me.xp || 0) - reward);
      batch.update(doc(db, 'users', me.uid), {
        xp,
        level: levelForXp(xp),
        tasksCompleted: Math.max(0, (me.tasksCompleted || 0) - 1),
      });
      // Logs are append-only, so a negative entry balances the leaderboard
      const logId = newId('log');
      batch.set(doc(db, 'circles', me.circleId!, 'logs', logId), {
        id: logId,
        taskId: task.id,
        taskTitle: taskTitle(task),
        taskCategory: task.category,
        completedBy: me.uid,
        completedByName: me.displayName,
        completedByEmoji: me.avatarEmoji,
        xpAwarded: -reward,
        completedAt: new Date().toISOString(),
      } satisfies TaskLog);
    }
    try {
      await batch.commit();
      celebrate.moment({ emoji: '↩️', title: 'Back on your list', body: 'No worries. It will be here when you are ready.', tone: 'info' });
    } catch (err) {
      console.error('Error un-completing task:', err);
    }
  };

  const toggleTask = (task: Task) => (isDoneNow(task) ? uncompleteTask(task) : completeTask(task));

  const saveTask = async (draft: TaskDraft) => {
    if (!userProfile?.circleId) return;
    const editing = sheet?.task;
    setSheet(null);
    try {
      if (editing) {
        await updateDoc(doc(db, 'circles', userProfile.circleId, 'tasks', editing.id), clean(draft));
        soundEffects.playTap();
        celebrate.moment({ emoji: '✏️', title: 'Saved', body: `"${draft.title}" is updated.`, tone: 'info' });
      } else {
        const id = newId('task');
        await setDoc(doc(db, 'circles', userProfile.circleId, 'tasks', id), clean({
          ...draft,
          id,
          status: 'Pending',
          streak: 0,
          completionCount: 0,
          createdById: userProfile.uid,
          createdAt: new Date().toISOString(),
        }));
        soundEffects.playPop();
        haptic(15);
        celebrate.burst({ x: window.innerWidth / 2, y: window.innerHeight * 0.75 }, 24);
        celebrate.moment(creationMoment(draft.title, members.filter(m => draft.assignedTo.includes(m.uid)), userProfile.uid));
      }
    } catch (err) {
      console.error('Error saving task:', err);
      celebrate.moment({ emoji: '😕', title: 'That did not save', body: 'Check your connection and try again.', tone: 'info' });
    }
  };

  const quickAdd = (title: string, emoji: string | null) =>
    saveTask({
      title,
      emoji,
      description: '',
      category: 'Routine',
      frequency: 'One-time',
      difficulty: 'Easy',
      xpReward: calculateXp('Easy', 'One-time'),
      assignedTo: [userProfile!.uid],
      timeOfDay: null,
      deadlineDate: dayKey(),
      isRecurring: false,
    });

  const deleteTask = async (task: Task) => {
    if (!userProfile?.circleId) return;
    const circleId = userProfile.circleId;
    setSheet(null);
    try {
      await deleteDoc(doc(db, 'circles', circleId, 'tasks', task.id));
      soundEffects.playUndo();
      celebrate.moment({
        emoji: '🍂',
        title: 'Let it go',
        body: `"${taskTitle(task)}" was removed.`,
        tone: 'info',
        action: {
          label: 'Undo',
          onClick: () => {
            setDoc(doc(db, 'circles', circleId, 'tasks', task.id), clean(task)).catch(err => console.error('Undo failed:', err));
            soundEffects.playPop();
          },
        },
      });
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleLogout = async () => {
    greetedRef.current = false;
    await signOut(auth);
  };

  if (loading) return <LoadingScreen />;

  if (!currentUser || !userProfile) {
    return <LoginScreen onLoginSuccess={profile => setUserProfile(profile)} />;
  }

  if (!userProfile.circleId) {
    return (
      <CircleManagement
        userProfile={userProfile}
        onCircleJoined={circleId => setUserProfile(prev => (prev ? { ...prev, circleId } : null))}
        onLogout={handleLogout}
      />
    );
  }

  const profile = { ...userProfile, level: levelForXp(userProfile.xp || 0) };
  const openNew = (preset?: SheetState['preset']) => setSheet({ preset });

  return (
    <AppShell tab={tab} onTabChange={setTab} onNewTask={() => openNew()} profile={profile}>
      {tab === 'today' && (
        <TodayView
          profile={profile}
          tasks={tasks}
          members={members}
          onToggle={toggleTask}
          onOpenTask={task => setSheet({ task })}
          onNewTask={openNew}
          onQuickAdd={quickAdd}
          onCheckin={saveCheckin}
        />
      )}
      {tab === 'plan' && (
        <PlanView
          tasks={tasks}
          members={members}
          currentUserId={profile.uid}
          onToggle={toggleTask}
          onOpenTask={task => setSheet({ task })}
          onNewTask={openNew}
        />
      )}
      {tab === 'family' && <FamilyView circle={circle} members={members} logs={logs} currentUserId={profile.uid} />}
      {tab === 'me' && (
        <MeView
          profile={profile}
          circle={circle}
          theme={theme}
          onThemeChange={changeTheme}
          onUpdateProfile={updateProfile}
          remindersOn={remindersOn}
          onToggleReminders={toggleReminders}
          onLogout={handleLogout}
        />
      )}

      <AnimatePresence>
        {sheet && (
          <TaskSheet
            key={sheet.task?.id || 'new'}
            members={members}
            currentUserId={profile.uid}
            taskToEdit={sheet.task}
            initialFrequency={sheet.preset?.frequency}
            initialTitle={sheet.preset?.title}
            onClose={() => setSheet(null)}
            onSave={saveTask}
            onDelete={deleteTask}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}

export default function App() {
  return (
    <CelebrationProvider>
      <SolRise />
    </CelebrationProvider>
  );
}
