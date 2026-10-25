import { FormEvent, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { collection, doc, getDocs, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import { ArrowLeft, KeyRound, LogOut, User, Users } from 'lucide-react';
import { db } from '../firebase';
import { Circle, Task, UserProfile } from '../types';
import { soundEffects } from '../utils/audio';
import Avatar from './ui/Avatar';

interface CircleManagementProps {
  userProfile: UserProfile;
  onCircleJoined: (circleId: string, circleName: string) => void;
  onLogout: () => void;
}

type Mode = 'choose' | 'create' | 'join';

const generateCircleCode = () => `FAM-${Math.floor(100000 + Math.random() * 900000)}`;
const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

// A gentle starter set so the first morning already has something to celebrate
const STARTER_TASKS: Pick<Task, 'title' | 'emoji' | 'description' | 'category' | 'frequency' | 'timeOfDay' | 'difficulty' | 'xpReward'>[] = [
  { title: 'Drink a glass of water', emoji: '💧', description: 'Start the day hydrated.', category: 'Routine', frequency: 'Daily', timeOfDay: '08:00', difficulty: 'Easy', xpReward: 10 },
  { title: 'Take a 10-minute walk', emoji: '🚶', description: 'Fresh air, clear head.', category: 'Exercise', frequency: 'Daily', timeOfDay: '13:00', difficulty: 'Easy', xpReward: 10 },
  { title: 'Tidy up for 10 minutes', emoji: '🧹', description: 'A calmer space for a calmer mind.', category: 'Chore', frequency: 'Daily', timeOfDay: '19:00', difficulty: 'Easy', xpReward: 10 },
  { title: 'Plan tomorrow', emoji: '🗓️', description: 'Pick the one thing that matters most.', category: 'Goal', frequency: 'Daily', timeOfDay: '21:00', difficulty: 'Easy', xpReward: 10 },
  { title: 'Weekly reset', emoji: '🧺', description: 'Laundry, groceries, and a fresh start.', category: 'Chore', frequency: 'Weekly', timeOfDay: null, difficulty: 'Medium', xpReward: 30 },
];

export default function CircleManagement({ userProfile, onCircleJoined, onLogout }: CircleManagementProps) {
  const [mode, setMode] = useState<Mode>('choose');
  const [circleName, setCircleName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const firstName = userProfile.displayName.split(' ')[0];

  const createCircle = async (name: string) => {
    setError('');
    setLoading(true);
    try {
      const circleId = newId('circle');
      const newCircle: Circle = { id: circleId, name, code: generateCircleCode(), createdById: userProfile.uid, createdAt: new Date().toISOString() };
      const batch = writeBatch(db);
      batch.set(doc(db, 'circles', circleId), newCircle);
      STARTER_TASKS.forEach((t, i) => {
        const id = newId('task');
        batch.set(doc(db, 'circles', circleId, 'tasks', id), {
          ...t,
          id,
          assignedTo: [userProfile.uid],
          status: 'Pending',
          streak: 0,
          isRecurring: true,
          recurrenceInterval: 1,
          recurrenceDurationType: 'indefinite',
          createdById: userProfile.uid,
          createdAt: new Date(Date.now() + i).toISOString(),
        });
      });
      await batch.commit();
      await updateDoc(doc(db, 'users', userProfile.uid), { circleId });
      soundEffects.playDayComplete();
      onCircleJoined(circleId, name);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not create your space. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (circleName.trim()) createCircle(circleName.trim());
  };

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();
    const code = inviteCode.trim().toUpperCase();
    if (!code) return;
    setError('');
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'circles'), where('code', '==', code)));
      if (snap.empty) throw new Error('We could not find a circle with that code. Double-check it and try again.');
      const circle = snap.docs[0].data() as Circle;
      await updateDoc(doc(db, 'users', userProfile.uid), { circleId: circle.id });
      soundEffects.playDayComplete();
      onCircleJoined(circle.id, circle.name);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not join that circle.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full bg-subtle rounded-2xl px-4 py-3.5 text-base font-semibold text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-primary/40';
  const primaryBtn = 'w-full py-3.5 rounded-2xl bg-primary text-on-primary font-bold glow-primary press cursor-pointer disabled:opacity-50';

  return (
    <div className="min-h-screen ambient flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Avatar user={userProfile} size={72} className="mx-auto" />
          <h1 className="font-display text-3xl font-semibold text-ink mt-4">Welcome, {firstName}</h1>
          <p className="text-muted mt-1">Who will you rise with?</p>
        </motion.div>

        {error && (
          <div role="alert" className="mb-4 p-3.5 rounded-2xl bg-danger-soft text-danger text-sm font-medium">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {mode === 'choose' && (
            <motion.div key="choose" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-3">
              {[
                { icon: <User className="w-5 h-5" />, title: 'Just me', body: 'A personal space for your own routines and goals.', onClick: () => createCircle(`${firstName}'s space`) },
                { icon: <Users className="w-5 h-5" />, title: 'Start a family circle', body: 'Share chores, cheer each other on. Invite others any time.', onClick: () => setMode('create') },
                { icon: <KeyRound className="w-5 h-5" />, title: 'I have an invite code', body: 'Join a circle someone already created.', onClick: () => setMode('join') },
              ].map(o => (
                <button
                  key={o.title}
                  onClick={o.onClick}
                  disabled={loading}
                  className="w-full card p-4 flex items-center gap-4 text-left hover:border-primary transition press cursor-pointer disabled:opacity-60"
                >
                  <span className="w-11 h-11 rounded-2xl bg-primary-soft text-primary flex items-center justify-center shrink-0">{o.icon}</span>
                  <span>
                    <span className="block font-semibold text-ink">{o.title}</span>
                    <span className="block text-sm text-muted">{o.body}</span>
                  </span>
                </button>
              ))}
              {loading && <p className="text-center text-sm text-muted pt-2">Preparing your first sunrise…</p>}
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.form key="create" onSubmit={handleCreate} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="card p-5 space-y-4">
              <button type="button" onClick={() => setMode('choose')} className="flex items-center gap-1 text-sm font-semibold text-muted cursor-pointer">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <label htmlFor="circle-name" className="block font-semibold text-ink">Name your circle</label>
              <input id="circle-name" autoFocus required value={circleName} onChange={e => setCircleName(e.target.value)} placeholder="e.g. The Sharma Home" maxLength={40} className={inputClass} />
              <button type="submit" disabled={loading || !circleName.trim()} className={primaryBtn}>
                {loading ? 'Creating…' : 'Create circle'}
              </button>
            </motion.form>
          )}

          {mode === 'join' && (
            <motion.form key="join" onSubmit={handleJoin} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="card p-5 space-y-4">
              <button type="button" onClick={() => setMode('choose')} className="flex items-center gap-1 text-sm font-semibold text-muted cursor-pointer">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <label htmlFor="invite-code" className="block font-semibold text-ink">Enter your invite code</label>
              <input id="invite-code" autoFocus required value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="FAM-123456" className={`${inputClass} uppercase tracking-widest font-mono`} />
              <button type="submit" disabled={loading || !inviteCode.trim()} className={primaryBtn}>
                {loading ? 'Joining…' : 'Join circle'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <button onClick={onLogout} className="mt-8 mx-auto flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink cursor-pointer">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );
}
