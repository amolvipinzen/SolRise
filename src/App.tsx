import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  updateDoc, 
  setDoc, 
  deleteDoc,
  writeBatch 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, Circle, Task, TaskLog } from './types';
import LoginScreen from './components/LoginScreen';
import CircleManagement from './components/CircleManagement';
import TaskList, { LavenderSprig } from './components/TaskList';
import Leaderboard from './components/Leaderboard';
import DoodleFeed from './components/DoodleFeed';
import PushSimulator from './components/PushSimulator';
import TaskFormModal from './components/TaskFormModal';
import { soundEffects } from './utils/audio';

import { 
  LogOut, 
  Sparkles, 
  Plus, 
  Bell, 
  Users, 
  User, 
  Settings, 
  CheckCircle, 
  Calendar, 
  Trophy, 
  RefreshCw,
  Clock,
  BookOpen,
  Menu,
  X,
  Copy,
  Check,
  ClipboardList,
  FileText,
  Camera
} from 'lucide-react';

const MOTIVATIONAL_MESSAGES = [
  "Every small chore completed is a step toward a happier, cleaner home. You've got this! 💪",
  "A tidy house is a tidy mind. Today is a brand new page to write your own shining story! ✨",
  "Success is the sum of small efforts, repeated day in and day out. Shine bright today! 🌟",
  "The best way to predict the future is to create it. Let's make today beautiful, one task at a time! 🚀",
  "Your home is your sanctuary. Fill it with love, positive energy, and small wins today! 🏡",
  "Start where you are. Use what you have. Do what you can. Have an amazing, productive day! ☀️",
  "Small daily improvements over time lead to stunning results. Believe in your family power! 💥",
  "Each chore is a small act of love and care for your wonderful home. Thank you for contributing! ❤️",
  "Great things are done by a series of small things brought together. Let's team up today! 🤝",
  "A positive attitude can turn any chore into a satisfying victory. Keep that beautiful smile on! 😊",
  "Consistency is what transforms average into excellence. You are building amazing habits! 🏆",
  "Good vibes only! Let's fill our home with music, laughter, and high-energy productivity today! 🎶",
  "Remember, a clean room brings absolute peace of mind. Treat yourself to a clean sanctuary! 🧘",
  "You don't have to be perfect, just be willing to make progress. Together, we make a perfect team! 🌈",
  "Every completed chore is a star on your journey of personal growth. Grab your stars today! ⭐",
  "Your contribution keeps this family circle strong, beautiful, and full of harmony. You are appreciated! 🤗",
  "The secret of getting ahead is getting started. Choose one simple chore and watch the momentum build! ⚡",
  "Today is full of endless opportunities. Let's conquer our routines and celebrate our victories! 🥳",
  "Happiness is not something readymade. It comes from our own daily actions and mutual care! 🌻",
  "Make today so awesome that yesterday gets jealous! Let's sparkle up the place! ✨",
  "Be the energy you want to attract. Let's bring sunshine and enthusiasm into our chores today! ☀️",
  "Our home is a canvas, and our daily care is the paint. Let's paint a masterpiece of comfort! 🎨",
  "A little progress each day adds up to big results. Go family, let's shine! 🚀",
  "Gratitude turns what we have into enough, and a tidy space turns chaos into clarity! 🕯️",
  "Your efforts do not go unnoticed. You are the heartbeat of this family's clean haven! 💓",
  "Focus on the step in front of you, not the whole staircase. One cheerful chore at a time! 🪜",
  "Clean spaces create fresh ideas and beautiful dreams. Let's clear the way for creativity! 🧠",
  "Chore-time can be game-time! Put on your favorite upbeat song and power through with joy! 🕺",
  "We rise by lifting each other up. Help a family member complete a chore today and spread the warmth! 🤝",
  "An organized home is a magnet for good luck, peaceful evenings, and sweet dreams! 🍀",
  "You are capable of doing amazing things! Let's make our home shine like the stars above! 🌌"
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [circle, setCircle] = useState<Circle | null>(null);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<TaskLog[]>([]);
  
  // App UI states
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'leaderboard' | 'feed' | 'notifications'>('tasks');
  const [pushNotification, setPushNotification] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGreetingDismissed, setIsGreetingDismissed] = useState(false);

  // Subscribe to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setCircle(null);
        setMembers([]);
        setTasks([]);
        setLogs([]);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // Subscribe to logged in User's profile in real-time
  useEffect(() => {
    if (!currentUser) return;

    let unsubscribe: (() => void) | null = null;
    let retryTimeout: NodeJS.Timeout | null = null;
    let retryCount = 0;
    const maxRetries = 3;

    const subscribeToProfile = () => {
      const userDocRef = doc(db, 'users', currentUser.uid);
      unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const profile = docSnap.data() as UserProfile;
          setUserProfile(profile);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error listening to user profile:", error);
        
        // If it failed with permission denied or offline, retry after a short delay (handles auth token sync race condition)
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying user profile subscription (attempt ${retryCount}/${maxRetries}) in 1500ms...`);
          setLoading(true);
          retryTimeout = setTimeout(() => {
            subscribeToProfile();
          }, 1500);
        } else {
          setLoading(false);
        }
      });
    };

    subscribeToProfile();

    return () => {
      if (unsubscribe) unsubscribe();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [currentUser]);

  // Subscribe to Circle, Members, Tasks, and Logs
  useEffect(() => {
    if (!userProfile?.circleId) {
      setCircle(null);
      setMembers([]);
      setTasks([]);
      setLogs([]);
      return;
    }

    const { circleId } = userProfile;

    // 1. Listen to Circle Metadata
    const circleUnsubscribe = onSnapshot(doc(db, 'circles', circleId), (docSnap) => {
      if (docSnap.exists()) {
        setCircle(docSnap.data() as Circle);
      }
    });

    // 2. Listen to Family Circle Members
    const membersQuery = query(collection(db, 'users'), where('circleId', '==', circleId));
    const membersUnsubscribe = onSnapshot(membersQuery, (querySnapshot) => {
      const familyMembers: UserProfile[] = [];
      querySnapshot.forEach((docSnap) => {
        familyMembers.push(docSnap.data() as UserProfile);
      });
      setMembers(familyMembers);
    });

    // 3. Listen to Tasks Subcollection inside the circle
    const tasksQuery = query(collection(db, 'circles', circleId, 'tasks'), orderBy('createdAt', 'desc'));
    const tasksUnsubscribe = onSnapshot(tasksQuery, (querySnapshot) => {
      const circleTasks: Task[] = [];
      querySnapshot.forEach((docSnap) => {
        circleTasks.push(docSnap.data() as Task);
      });
      setTasks(circleTasks);
    });

    // 4. Listen to Logs Subcollection inside the circle
    const logsQuery = query(
      collection(db, 'circles', circleId, 'logs'), 
      orderBy('completedAt', 'desc'), 
      limit(25)
    );
    const logsUnsubscribe = onSnapshot(logsQuery, (querySnapshot) => {
      const circleLogs: TaskLog[] = [];
      querySnapshot.forEach((docSnap) => {
        circleLogs.push(docSnap.data() as TaskLog);
      });
      setLogs(circleLogs);
    });

    return () => {
      circleUnsubscribe();
      membersUnsubscribe();
      tasksUnsubscribe();
      logsUnsubscribe();
    };

  }, [userProfile?.circleId]);

  // Background Timing Deadline Alerts Engine
  useEffect(() => {
    if (!userProfile?.circleId || tasks.length === 0) return;

    // Keep track of times we have already alerted in the current hour/minute to avoid duplicates
    const alertedTasksMap: { [key: string]: boolean } = {};

    const checkDeadlines = () => {
      const now = new Date();
      const currentHourMin = now.toTimeString().slice(0, 5); // "HH:MM"

      tasks.forEach((task) => {
        if (task.status === 'Pending' && task.timeOfDay === currentHourMin) {
          // If already alerted this turn, skip
          const alertKey = `${task.id}-${currentHourMin}`;
          if (alertedTasksMap[alertKey]) return;

          // Only alert if current user is assigned to this task
          const isAssigned = task.assignedTo.includes(userProfile.uid);
          if (isAssigned) {
            alertedTasksMap[alertKey] = true;
            
            // Trigger beautiful audio beep and simulated push toast
            soundEffects.playAlert();
            triggerPushToast(`⏰ Task Deadline: "${task.title}" is due right now at ${task.timeOfDay}!`);
          }
        }
      });
    };

    // Run check immediately and then every 30 seconds
    checkDeadlines();
    const interval = setInterval(checkDeadlines, 30000);
    return () => clearInterval(interval);

  }, [tasks, userProfile?.circleId, userProfile?.uid]);

  // Utility to fire a beautiful full screen toast
  const triggerPushToast = (message: string) => {
    setPushNotification(message);
    // Auto clear after 6 seconds
    setTimeout(() => {
      setPushNotification(null);
    }, 6000);
  };

  const handleLogout = async () => {
    soundEffects.playChime();
    await signOut(auth);
  };

  // Toggle task complete (gives XP, levels up, registers logs!)
  const handleToggleComplete = async (task: Task) => {
    if (!userProfile || !userProfile.circleId) return;

    const { circleId } = userProfile;
    const isPending = task.status === 'Pending';
    const xpReward = task.xpReward || 10;

    try {
      if (isPending) {
        // 1. Calculate new XP & level
        const currentXP = userProfile.xp || 0;
        const newXP = currentXP + xpReward;

        // Level-up threshold = 150 XP per level
        const oldLevel = Math.floor(currentXP / 150) + 1;
        const newLevel = Math.floor(newXP / 150) + 1;

        // Update profile in Firestore
        await updateDoc(doc(db, 'users', userProfile.uid), {
          xp: newXP,
          level: newLevel
        });

        // Calculate streak consecutively based on frequency and lastCompletedAt
        let newStreak = 1;
        let isStreakAchieved = false;
        
        if (task.lastCompletedAt && (task.frequency === 'Daily' || task.frequency === 'Weekly' || task.frequency === 'Monthly')) {
          const msDiff = new Date().getTime() - new Date(task.lastCompletedAt).getTime();
          const hoursDiff = msDiff / (1000 * 60 * 60);
          
          let consecutive = false;
          if (task.frequency === 'Daily') {
            // Completed consecutively if done within 36 hours of the last completion
            if (hoursDiff <= 36) consecutive = true;
          } else if (task.frequency === 'Weekly') {
            // Completed consecutively if done within 10 days of the last completion
            if (hoursDiff <= 10 * 24) consecutive = true;
          } else if (task.frequency === 'Monthly') {
            // Completed consecutively if done within 40 days of the last completion
            if (hoursDiff <= 40 * 24) consecutive = true;
          }
          
          if (consecutive) {
            newStreak = (task.streak || 0) + 1;
            if (newStreak >= 2) {
              isStreakAchieved = true;
            }
          } else {
            newStreak = 1;
          }
        } else {
          // If no previous completion timestamp, increment the existing streak if any, or default to 1
          newStreak = (task.streak || 0) + 1;
          if (newStreak >= 2 && (task.frequency === 'Daily' || task.frequency === 'Weekly' || task.frequency === 'Monthly')) {
            isStreakAchieved = true;
          }
        }

        // 2. Play sound effects & trigger toasts
        if (newLevel > oldLevel) {
          soundEffects.playLevelUp();
          triggerPushToast(`🎉 LEVEL UP! You reached Level ${newLevel}! Keep up the amazing work! 🌟`);
          if (isStreakAchieved) {
            setTimeout(() => {
              soundEffects.playStreak();
              const streakEmoji = task.frequency === 'Daily' ? '🔥' : task.frequency === 'Weekly' ? '🗓️' : '🌙';
              const frequencyUnit = task.frequency === 'Daily' ? 'days' : task.frequency === 'Weekly' ? 'weeks' : 'months';
              triggerPushToast(`${streakEmoji} WINNING STREAK! You completed "${task.title}" consecutively for ${newStreak} ${frequencyUnit}! Keep up the amazing routine! ✨`);
            }, 3000);
          }
        } else if (isStreakAchieved) {
          soundEffects.playStreak();
          const streakEmoji = task.frequency === 'Daily' ? '🔥' : task.frequency === 'Weekly' ? '🗓️' : '🌙';
          const frequencyUnit = task.frequency === 'Daily' ? 'days' : task.frequency === 'Weekly' ? 'weeks' : 'months';
          triggerPushToast(`${streakEmoji} WINNING STREAK! You completed "${task.title}" consecutively for ${newStreak} ${frequencyUnit}! Keep up the amazing routine! ✨`);
        } else {
          soundEffects.playChime();
        }

        // 3. Mark task completed with consecutive streak
        await updateDoc(doc(db, 'circles', circleId, 'tasks', task.id), {
          status: 'Completed',
          streak: newStreak,
          lastCompletedAt: new Date().toISOString(),
          lastCompletedBy: userProfile.uid
        });

        // 4. Create historical log
        const logId = 'log-' + Math.random().toString(36).substring(2, 11).toUpperCase();
        const streakSuffix = isStreakAchieved ? ` (🔥 ${newStreak}x Streak!)` : '';
        const newLog: TaskLog = {
          id: logId,
          taskId: task.id,
          taskTitle: `${task.title}${streakSuffix}`,
          taskCategory: task.category,
          completedBy: userProfile.uid,
          completedByName: userProfile.displayName,
          completedByEmoji: userProfile.avatarEmoji,
          xpAwarded: xpReward,
          completedAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'circles', circleId, 'logs', logId), newLog);

      } else {
        // Uncomplete task: toggles back to pending
        soundEffects.playAlert();
        await updateDoc(doc(db, 'circles', circleId, 'tasks', task.id), {
          status: 'Pending',
          streak: 0 // streak breaks on toggle back
        });
      }
    } catch (err) {
      console.error("Error toggling task complete:", err);
    }
  };

  // Reset all tasks back to Pending for family reuse
  const handleResetAllTasks = async () => {
    if (!userProfile?.circleId || tasks.length === 0) return;
    soundEffects.playChime();
    
    try {
      for (const t of tasks) {
        if (t.status === 'Completed') {
          await updateDoc(doc(db, 'circles', userProfile.circleId, 'tasks', t.id), {
            status: 'Pending'
          });
        }
      }
      triggerPushToast("🔄 All family chores and routines have been reset to Pending!");
    } catch (err) {
      console.error("Error resetting tasks:", err);
    }
  };

  // Save a task (handles both create and update)
  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'status' | 'streak' | 'createdAt' | 'createdById'>) => {
    if (!userProfile?.circleId) return;
    
    // Clean any undefined values to avoid Firestore errors (e.g. deadlineDate is undefined for Daily tasks)
    const cleanedData = Object.entries(taskData).reduce((acc, [key, value]) => {
      acc[key] = value === undefined ? null : value;
      return acc;
    }, {} as any);
    
    try {
      if (editingTask) {
        // Update mode
        await updateDoc(doc(db, 'circles', userProfile.circleId, 'tasks', editingTask.id), {
          ...cleanedData
        });
        setIsTaskModalOpen(false);
        setEditingTask(null);
        triggerPushToast(`✏️ Task Updated: "${taskData.title}"`);
      } else {
        // Create mode
        const taskId = 'task-' + Math.random().toString(36).substring(2, 11).toUpperCase();
        const newTask: Task = {
          ...cleanedData,
          id: taskId,
          status: 'Pending',
          streak: 0,
          createdById: userProfile.uid,
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'circles', userProfile.circleId, 'tasks', taskId), newTask);
        setIsTaskModalOpen(false);
        triggerPushToast(`✨ New Task Created: "${newTask.title}"`);
      }
    } catch (err) {
      console.error("Error saving task:", err);
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId: string) => {
    if (!userProfile?.circleId) return;
    soundEffects.playAlert();
    try {
      await deleteDoc(doc(db, 'circles', userProfile.circleId, 'tasks', taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // Reorder tasks in Firestore (Atomic Write Batch)
  const handleReorderTasks = async (reorderedTasks: Task[]) => {
    if (!userProfile?.circleId) return;
    try {
      const batch = writeBatch(db);
      let hasUpdates = false;

      reorderedTasks.forEach((task) => {
        const currentTask = tasks.find(t => t.id === task.id);
        const oldOrder = currentTask?.order;
        if (oldOrder !== task.order) {
          const taskDocRef = doc(db, 'circles', userProfile.circleId!, 'tasks', task.id);
          batch.update(taskDocRef, { order: task.order });
          hasUpdates = true;
        }
      });

      if (hasUpdates) {
        await batch.commit();
      }
    } catch (err) {
      console.error("Error saving task order:", err);
    }
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-purple-50">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-10 h-10 text-purple-600 animate-spin" />
          <p className="font-caveat text-2xl font-bold text-purple-900">Loading your chore notebook...</p>
        </div>
      </div>
    );
  }

  // Not Logged In Screen
  if (!currentUser || !userProfile) {
    return (
      <div className="min-h-screen bg-[#F5F0FF] py-10 flex items-center justify-center">
        <LoginScreen onLoginSuccess={(profile) => setUserProfile(profile)} />
      </div>
    );
  }

  // No Circle Screen
  if (!userProfile.circleId) {
    return (
      <div className="min-h-screen bg-[#FAF8FF] paper-texture py-10">
        <CircleManagement 
          userProfile={userProfile} 
          onCircleJoined={(circleId) => {
            setUserProfile(prev => prev ? { ...prev, circleId } : null);
          }}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8FF] paper-texture text-purple-950 flex flex-col pb-12 font-sans relative">
      
      {/* 🔔 Simulated Live Push Notification Popup Alert */}
      {pushNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-purple-900 text-white rounded-2xl shadow-xl p-4 flex items-start gap-3 border-2 border-purple-400">
            <div className="w-8 h-8 bg-purple-800 rounded-full flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-amber-300 animate-swing" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-xs font-black tracking-wider text-purple-300 uppercase">FCM Push Notification</div>
              <p className="text-xs font-semibold leading-relaxed">{pushNotification}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {/* Top Family Header Board Card with Integrated Task Bar */}
        <div className="bg-[#FAF8FF] border border-[#E9E4F5] rounded-[32px] p-5 sm:p-6 shadow-xs flex flex-col gap-5">
          
          {/* Top Row: User Profile & Burger Menu */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {/* Avatar Container */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#E8DCFC] rounded-full border border-[#D5C2F8] flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                {userProfile.avatarUrl ? (
                  <img src={userProfile.avatarUrl} alt="avatar" className="w-full h-full object-cover select-none" />
                ) : (
                  <span className="text-3xl sm:text-4xl select-none">{userProfile.avatarEmoji}</span>
                )}
              </div>
              
              {/* User Info Details */}
              <div className="min-w-0">
                <h2 className="font-caveat text-2xl sm:text-3xl font-extrabold text-[#1F1235] leading-tight flex items-center gap-1.5 truncate">
                  Hi, {userProfile.displayName}! 🌸
                </h2>
                
                <div className="flex items-center gap-1.5 mt-1">
                  <Trophy className="w-4 h-4 text-[#C19519] fill-[#F6C644] shrink-0" />
                  <span className="text-xs sm:text-[13px] font-bold text-[#7D66D4]">
                    Level {userProfile.level} ({userProfile.xp} XP)
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Users className="w-4 h-4 text-[#8A7EA6] shrink-0" />
                  <span className="text-xs sm:text-[13px] font-medium text-[#7E73A6]">
                    {members.length} members
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Navigation Tabs */}
          <div className="bg-[#F3EEFA] rounded-[24px] p-1 sm:p-1.5 flex items-center gap-0.5 sm:gap-1.5 w-full">
            <button
              onClick={() => {
                setActiveTab('tasks');
                setIsMenuOpen(false);
              }}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-0.5 sm:px-3 rounded-[18px] text-[11px] sm:text-sm font-bold transition-all duration-200 transform active:scale-95 cursor-pointer ${
                activeTab === 'tasks' && !isMenuOpen
                  ? 'bg-[#9D82F2] text-white shadow-sm shadow-[#9D82F2]/25' 
                  : 'text-[#7A63D4] hover:bg-[#FAF8FF]/40'
              }`}
            >
              <ClipboardList className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === 'tasks' && !isMenuOpen ? 'text-white' : 'text-[#7A63D4]'}`} />
              <span>Tasks</span>
            </button>
            
            <button
              onClick={() => {
                setActiveTab('leaderboard');
                setIsMenuOpen(false);
              }}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-0.5 sm:px-3 rounded-[18px] text-[11px] sm:text-sm font-bold transition-all duration-200 transform active:scale-95 cursor-pointer ${
                activeTab === 'leaderboard' && !isMenuOpen
                  ? 'bg-[#9D82F2] text-white shadow-sm shadow-[#9D82F2]/25' 
                  : 'text-[#7A63D4] hover:bg-[#FAF8FF]/40'
              }`}
            >
              <Trophy className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === 'leaderboard' && !isMenuOpen ? 'text-white' : 'text-[#7A63D4]'}`} />
              <span>Ranking</span>
            </button>
            
            <button
              onClick={() => {
                setActiveTab('feed');
                setIsMenuOpen(false);
              }}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-0.5 sm:px-3 rounded-[18px] text-[11px] sm:text-sm font-bold transition-all duration-200 transform active:scale-95 cursor-pointer ${
                activeTab === 'feed' && !isMenuOpen
                  ? 'bg-[#9D82F2] text-white shadow-sm shadow-[#9D82F2]/25' 
                  : 'text-[#7A63D4] hover:bg-[#FAF8FF]/40'
              }`}
            >
              <FileText className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === 'feed' && !isMenuOpen ? 'text-white' : 'text-[#7A63D4]'}`} />
              <span>Feed</span>
            </button>
 
            {circle && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-0.5 sm:px-3 rounded-[18px] text-[11px] sm:text-sm font-bold transition-all duration-200 transform active:scale-95 cursor-pointer ${
                  isMenuOpen 
                    ? 'bg-[#9D82F2] text-white shadow-sm shadow-[#9D82F2]/25' 
                    : 'text-[#7A63D4] hover:bg-[#FAF8FF]/40'
                }`}
                title="Family Circle Menu"
              >
                <Menu className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isMenuOpen ? 'text-white' : 'text-[#7A63D4]'}`} />
                <span>More</span>
              </button>
            )}
          </div>

        </div>

        {/* Daily Positive Motivation Sticky Note Card */}
        {!isGreetingDismissed && (() => {
          const todayDate = new Date();
          const messageIndex = todayDate.getDate() - 1;
          const dailyMessage = MOTIVATIONAL_MESSAGES[messageIndex % MOTIVATIONAL_MESSAGES.length];
          return (
            <div className="relative bg-gradient-to-r from-[#FAF8FF] via-[#F5F0FF] to-[#FAF8FF] border border-[#E2D9F3] rounded-[24px] p-5 sm:p-6 pr-10 sm:pr-20 transition-all duration-300 flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-[0_4px_16px_rgba(157,130,242,0.06)] relative overflow-hidden">
              
              {/* Close Button */}
              <button 
                onClick={() => setIsGreetingDismissed(true)}
                className="absolute top-3.5 right-3.5 text-[#A699C7] hover:text-[#7A63D4] hover:bg-[#F3EEFA] p-1.5 rounded-full transition-all cursor-pointer z-20"
                title="Dismiss greeting"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="flex flex-row items-center gap-4 z-10 text-left flex-1 w-full">
                {/* Round soft-yellow circle containing sun illustration */}
                <div className="w-14 h-14 bg-gradient-to-br from-[#FFFCEF] to-[#FFF1B8] rounded-full flex items-center justify-center shrink-0 border border-[#FFE78A] shadow-xs">
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="w-10 h-10 animate-pulse select-none"
                  >
                    {/* Sun rays */}
                    <path 
                      d="M12 3V5M12 19V21M4 12H2M22 12H20M18.36 5.64L16.95 7.05M7.05 16.95L5.64 18.36M18.36 18.36L16.95 16.95M7.05 7.05L5.64 5.64" 
                      stroke="#E28A07" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                    />
                    {/* Sun center */}
                    <circle cx="12" cy="12" r="4.5" fill="#FFC72C" stroke="#E28A07" strokeWidth="1" />
                  </svg>
                </div>
                
                <div className="space-y-1 flex-1 min-w-0">
                  <h4 className="font-caveat text-2xl sm:text-3xl font-black text-[#5C42A5] leading-none flex items-center justify-start gap-1.5">
                    Good morning, Family! 
                    <svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse select-none shrink-0 ml-1"
                    >
                      {/* Sun rays */}
                      <path 
                        d="M12 3V5M12 19V21M4 12H2M22 12H20M18.36 5.64L16.95 7.05M7.05 16.95L5.64 18.36M18.36 18.36L16.95 16.95M7.05 7.05L5.64 5.64" 
                        stroke="#E28A07" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                      />
                      {/* Sun center */}
                      <circle cx="12" cy="12" r="4.5" fill="#FFC72C" stroke="#E28A07" strokeWidth="1" />
                    </svg>
                  </h4>
                  <p className="font-sans text-xs sm:text-sm text-[#7E7399] font-medium leading-relaxed mt-1 pr-2 sm:pr-8">
                    {dailyMessage}
                  </p>
                </div>
              </div>

              {/* Decorative Watercolor Lavender Sprig on the right */}
              <div className="hidden sm:block shrink-0 absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-90 z-0">
                <LavenderSprig className="w-12 h-14 sm:w-14 sm:h-16" />
              </div>
            </div>
          );
        })()}

        {/* Desktop Layout Grid (Displays columns in elegant, highly professional layouts) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Task lists (Takes 7 Cols on desktop) */}
          <div className={`md:col-span-7 space-y-6 ${activeTab !== 'tasks' ? 'hidden md:block' : ''}`}>
            <TaskList 
              tasks={tasks} 
              members={members} 
              currentUserId={userProfile.uid}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
              onCreateTaskClick={() => setIsTaskModalOpen(true)}
              onEditTaskClick={(task) => {
                setEditingTask(task);
                setIsTaskModalOpen(true);
              }}
              onReorderTasks={handleReorderTasks}
            />
          </div>

          {/* Right Columns: Gamification, Live Logs, FCM Simulator (Takes 5 Cols on desktop) */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Leaderboard segment */}
            <div className={`${activeTab !== 'leaderboard' ? 'hidden md:block' : ''}`}>
              <Leaderboard 
                members={members} 
                currentUserId={userProfile.uid} 
                logs={logs}
                onTabChange={(tab) => {
                  setActiveTab(tab);
                  setIsMenuOpen(false);
                }}
                onAddTaskClick={() => {
                  setIsTaskModalOpen(true);
                }}
                onProfileClick={() => {
                  setIsMenuOpen(true);
                }}
              />
            </div>

            {/* Live Feed ledger log */}
            <div className={`${activeTab !== 'feed' ? 'hidden md:block' : ''}`}>
              <DoodleFeed logs={logs} />
            </div>

            {/* Push Simulator Panel */}
            <div className={`${activeTab !== 'notifications' ? 'hidden md:block' : ''}`}>
              <PushSimulator 
                userProfile={userProfile} 
                onSimulateNotification={(msg) => triggerPushToast(msg)} 
              />
            </div>

          </div>

        </div>

      </div>

      {/* Side Drawer Menu Overlay (Rendered at root viewport level to avoid parent container translate/clip) */}
      {isMenuOpen && circle && (
        <>
          {/* Background overlay backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[90] animate-in fade-in duration-200" 
            onClick={() => setIsMenuOpen(false)} 
          />
          
          {/* Side Drawer Menu */}
          <div className="fixed right-0 top-0 bottom-0 h-full w-80 sm:w-96 bg-white border-l-2 border-purple-100 shadow-2xl p-6 flex flex-col z-[100] animate-in slide-in-from-right duration-300">
            
            {/* Drawer Content */}
            <div className="space-y-6 flex-1 overflow-y-auto pr-1 min-h-0 pb-4">
              
              {/* Header of Drawer */}
              <div className="flex items-center justify-between border-b pb-4 border-purple-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-purple-400 tracking-wider">Family Circle</div>
                    <div className="text-base font-bold text-purple-900 leading-tight truncate max-w-[160px] sm:max-w-[200px]">{circle.name}</div>
                  </div>
                </div>
                
                {/* Close Button */}
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 hover:bg-purple-50 text-purple-400 hover:text-purple-600 rounded-lg transition-colors cursor-pointer"
                  title="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Invite Code Block */}
              <div className="space-y-2">
                <div className="text-[10px] font-black uppercase text-purple-400 tracking-wider">Invite Code</div>
                <p className="text-xs text-slate-500 leading-normal">
                  Share this code with your family members to let them join this Circle!
                </p>
                <div className="bg-purple-50/50 hover:bg-purple-50 p-3 rounded-xl border-2 border-dashed border-purple-200 flex items-center justify-between gap-3 group transition-all">
                  <div className="font-mono text-sm font-bold text-purple-700 select-all tracking-wide">{circle.code}</div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(circle.code);
                      setCopied(true);
                      soundEffects.playChime();
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-1.5 hover:bg-purple-100 rounded-lg text-purple-600 hover:text-purple-800 transition-all cursor-pointer flex items-center justify-center"
                    title="Copy Invite Code"
                  >
                    {copied ? <Check className="w-4.5 h-4.5 text-emerald-600" /> : <Copy className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {copied && (
                  <div className="text-xs font-black text-emerald-600 animate-pulse text-right">
                    Code Copied! 📋
                  </div>
                )}
              </div>

              {/* Push Notifications Simulator Option */}
              <div className="space-y-3 border-t pt-5 border-purple-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <Bell className="w-3.5 h-3.5 text-purple-600 animate-swing" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">Push Notifications</span>
                </div>
                <p className="text-xs text-slate-500 leading-normal">
                  Send and test family-wide alerts & real-time live push notifications!
                </p>
                <button
                  onClick={() => {
                    setActiveTab('notifications');
                    setIsMenuOpen(false);
                    soundEffects.playChime();
                  }}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-2 border-2 cursor-pointer ${
                    activeTab === 'notifications'
                      ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                      : 'bg-white hover:bg-purple-50 border-purple-100 text-[#7A63D4]'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span>Open Push Simulator</span>
                </button>
              </div>

              {/* Select Avatar Option */}
              <div className="space-y-3 border-t pt-5 border-purple-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">Select Your Avatar</span>
                </div>
                
                {/* Custom Photo Upload Block */}
                <div className="bg-purple-50/30 border border-purple-100 p-3 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Custom Profile Photo</span>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                      {userProfile.avatarUrl ? (
                        <img src={userProfile.avatarUrl} alt="custom avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl select-none">{userProfile.avatarEmoji}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <label 
                        htmlFor="custom-photo-file"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-purple-200 hover:border-purple-300 text-[11px] font-bold text-purple-700 rounded-lg cursor-pointer transition-all shadow-2xs"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </label>
                      <input 
                        type="file"
                        id="custom-photo-file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          soundEffects.playChime();
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const img = new Image();
                            img.onload = async () => {
                              // Canvas Resizing to 128x128 center crop to keep it lightweight for firestore
                              const canvas = document.createElement('canvas');
                              canvas.width = 128;
                              canvas.height = 128;
                              const ctx = canvas.getContext('2d');
                              if (ctx) {
                                // Draw image squared and cropped center
                                const minSize = Math.min(img.width, img.height);
                                const sx = (img.width - minSize) / 2;
                                const sy = (img.height - minSize) / 2;
                                ctx.drawImage(img, sx, sy, minSize, minSize, 0, 0, 128, 128);
                                
                                const base64Image = canvas.toDataURL('image/jpeg', 0.8);
                                
                                try {
                                  // Update local state
                                  setUserProfile({
                                    ...userProfile,
                                    avatarUrl: base64Image
                                  });
                                  // Update Firestore
                                  await updateDoc(doc(db, 'users', userProfile.uid), {
                                    avatarUrl: base64Image
                                  });
                                  triggerPushToast("📸 Custom profile photo uploaded successfully!");
                                } catch (err) {
                                  console.error("Failed to save profile picture:", err);
                                }
                              }
                            };
                            img.src = event.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                      
                      {userProfile.avatarUrl && (
                        <button
                          onClick={async () => {
                            soundEffects.playChime();
                            try {
                              setUserProfile({
                                ...userProfile,
                                avatarUrl: undefined
                              });
                              await updateDoc(doc(db, 'users', userProfile.uid), {
                                avatarUrl: null // clear in Firestore
                              });
                              triggerPushToast("🗑️ Custom profile photo cleared.");
                            } catch (err) {
                              console.error("Failed to clear profile picture:", err);
                            }
                          }}
                          className="block text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors"
                        >
                          Clear custom photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-normal">
                  Or pick an emoji to change your avatar across the family chore book & leaderboard!
                </p>
                <div className="grid grid-cols-6 gap-2 p-2 bg-purple-50/50 rounded-xl border-2 border-dashed border-purple-200">
                  {['🦊', '🦁', '🐯', '🐨', '🐼', '🐻', '🐱', '🐶', '🐰', '🦄', '🐺', '🐸', '🐵', '🐧', '🐥', '🦉'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={async () => {
                        if (!userProfile) return;
                        soundEffects.playChime();
                        try {
                          // Clear custom image url when selecting an emoji
                          setUserProfile({
                            ...userProfile,
                            avatarEmoji: emoji,
                            avatarUrl: undefined
                          });
                          // Update firestore
                          await updateDoc(doc(db, 'users', userProfile.uid), {
                            avatarEmoji: emoji,
                            avatarUrl: null
                          });
                        } catch (err) {
                          console.error("Failed to update avatar:", err);
                        }
                      }}
                      className={`text-2xl p-1 rounded-lg hover:bg-purple-100 transition-all transform hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center ${
                        !userProfile.avatarUrl && userProfile.avatarEmoji === emoji ? 'bg-purple-200 border border-purple-400 scale-105 shadow-xs' : 'bg-transparent'
                      }`}
                      title="Set as profile avatar"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Family Members list in circle */}
              {members.length > 0 && (
                <div className="space-y-3 border-t pt-5 border-purple-100">
                  <div className="text-[10px] font-black uppercase text-purple-400 tracking-wider flex items-center justify-between">
                    <span>Family Members</span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-[9px] font-bold">
                      {members.length} Active
                    </span>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1 divide-y divide-purple-50">
                    {members.map((m) => (
                      <div key={m.uid} className="flex items-center gap-3 py-2 px-2.5 rounded-xl hover:bg-purple-50/40 transition-colors first:pt-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden shrink-0 shadow-xs border border-purple-200">
                          {m.avatarUrl ? (
                            <img src={m.avatarUrl} alt={m.displayName} className="w-full h-full object-cover select-none" />
                          ) : (
                            <span className="text-xl select-none">{m.avatarEmoji}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-purple-900 truncate">{m.displayName}</div>
                          <div className="text-xs text-purple-500 font-medium">Level {m.level} • {m.xp} XP</div>
                        </div>
                        <span className="text-[9px] font-black uppercase bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md shrink-0">
                          {m.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer containing Log Out */}
            <div className="border-t pt-4 border-purple-100 mt-auto shrink-0">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-sm font-bold rounded-xl transition-all cursor-pointer border border-red-200/50"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out from Circle</span>
              </button>
            </div>

          </div>
        </>
      )}

      {/* Modal: Task form */}
      {isTaskModalOpen && (
        <TaskFormModal 
          familyMembers={members} 
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
          taskToEdit={editingTask || undefined}
        />
      )}

      {/* Footer credits line */}
      <footer className="text-center text-xs font-bold text-purple-400 mt-12 mb-6">
        <div className="flex justify-center items-center gap-1.5 font-caveat text-lg text-purple-500">
          <BookOpen className="w-4 h-4" />
          <span>Hand-drafted Purple Theme • Built with Firebase auth, Firestore, & Web Audio synth</span>
        </div>
      </footer>

    </div>
  );
}
