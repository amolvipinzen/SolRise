import { Task, UserProfile } from '../types';
import { streakUnit, taskTitle } from './tasks';

export interface Moment {
  emoji: string;
  title: string;
  body?: string;
}

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

export interface CompletionContext {
  task: Task;
  now: Date;
  remainingToday: number; // items still open on today's page after this one
  isFirstToday: boolean;
  wasOverdue: boolean;
  taskStreak: number;
}

// Chooses the message that best reflects what this completion meant, most specific first
export const completionMoment = (ctx: CompletionContext): Moment => {
  const { task, now, remainingToday, isFirstToday, wasOverdue, taskStreak } = ctx;
  const hour = now.getHours();
  const name = taskTitle(task);

  if (taskStreak >= 3 && task.frequency !== 'One-time') {
    return {
      emoji: '🔥',
      title: `${taskStreak} ${streakUnit(task.frequency)} in a row`,
      body: pick([
        'This is becoming part of who you are.',
        'Consistency looks good on you.',
        'You keep showing up. That is the whole secret.',
      ]),
    };
  }
  if (remainingToday === 1) {
    return { emoji: '🌤️', title: 'Just one more to go', body: 'Your day is almost fully risen.' };
  }
  if (wasOverdue) {
    return {
      emoji: '🤍',
      title: 'Late still counts',
      body: pick([
        'Closing the loop takes courage. Well done.',
        'It was hanging over you, and now it is not.',
        'Done is better than perfect. Breathe out.',
      ]),
    };
  }
  if (task.difficulty === 'Hard') {
    return {
      emoji: '💪',
      title: 'That was a tough one',
      body: pick(['And you did it anyway. Take a moment to feel that.', 'Hard things get easier because of days like this.']),
    };
  }
  if (isFirstToday) {
    if (hour < 9) return { emoji: '🌅', title: 'Early bird!', body: 'First win done before most people finish their coffee.' };
    return {
      emoji: '✨',
      title: 'First win of the day',
      body: pick(['Momentum starts with one.', 'The hardest part was starting. Done.', 'You are off and rising.']),
    };
  }
  if (hour >= 21 || hour < 4) {
    return { emoji: '🌙', title: 'Showing up, even now', body: 'Thank you for taking care of this tonight. Rest well soon.' };
  }

  const byCategory: Record<Task['category'], Moment[]> = {
    Exercise: [
      { emoji: '💪', title: 'Your body thanks you', body: `${name}: done. Feel that energy.` },
      { emoji: '⚡', title: 'Moved and grooved', body: 'Every bit of movement counts.' },
    ],
    Chore: [
      { emoji: '🏡', title: 'Home feels lighter', body: 'Future you walks into a calmer space.' },
      { emoji: '✨', title: 'Sparkle restored', body: `${name}: off your mind for good.` },
    ],
    Routine: [
      { emoji: '🌱', title: 'Routine kept', body: 'Small habits quietly build a big life.' },
      { emoji: '🍃', title: 'Steady and kind', body: 'This is how good days are made.' },
    ],
    Goal: [
      { emoji: '🎯', title: 'One step closer', body: 'Progress on what matters most to you.' },
      { emoji: '🚀', title: 'Goal energy', body: `${name}: that moved the needle.` },
    ],
  };
  return pick(byCategory[task.category]);
};

export const creationMoment = (title: string, assignees: UserProfile[], myUid: string): Moment => {
  const others = assignees.filter(a => a.uid !== myUid);
  if (others.length === 1 && assignees.length === 1) {
    return { emoji: '💌', title: `Sent to ${others[0].displayName}`, body: `"${title}" is on their list now.` };
  }
  if (others.length > 0) {
    return { emoji: '🤝', title: 'Shared with the family', body: `"${title}" is now a team effort.` };
  }
  return pick([
    { emoji: '🌱', title: 'Planted!', body: `"${title}" is on your path. Future you says thanks.` },
    { emoji: '🌱', title: 'Seed planted', body: 'Writing it down is the first step to doing it.' },
    { emoji: '🌱', title: 'Got it', body: `"${title}" is safely out of your head and on your list.` },
  ]);
};

export const MOODS = [
  { emoji: '😄', label: 'Great', reply: 'Love that energy! Let it carry you today.' },
  { emoji: '🙂', label: 'Good', reply: 'A good day to make progress.' },
  { emoji: '😐', label: 'Okay', reply: 'Okay is a fine place to start. Small steps today.' },
  { emoji: '😔', label: 'Low', reply: 'Be gentle with yourself. Even one small thing is a win.' },
  { emoji: '😫', label: 'Stressed', reply: 'Let us keep today light. Pick just one thing that matters.' },
];

export const DAILY_QUOTES = [
  'Small steps, every day, add up to a life you are proud of.',
  'You do not have to do it all. Just do the next thing.',
  'Progress, not perfection.',
  'The sun rises every day without asking permission. So can you.',
  'A little better than yesterday is plenty.',
  'Your future is built in the ordinary moments of today.',
  'Be kind to the person doing your tasks today. It is you.',
  'Start where you are. Use what you have. Do what you can.',
  'Discipline is choosing what you want most over what you want now.',
  'Rest is part of the rhythm, not a break from it.',
  'One focused hour can change the shape of a whole day.',
  'Done is a beautiful word.',
  'Make it easy to begin. The rest will follow.',
  'Celebrate the small wins. They are the big ones in disguise.',
  'Consistency beats intensity, every single time.',
  'You are allowed to be a work in progress.',
  'Light the way for yourself first.',
  'Today counts, even if it is messy.',
  'What you do every day matters more than what you do once in a while.',
  'Show up for your future self.',
  'Every sunrise is an invitation to begin again.',
];

export const dailyQuote = (d: Date = new Date()) => {
  const start = new Date(d.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((d.getTime() - start.getTime()) / 86_400_000);
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
};

export const STREAK_MILESTONES = [3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365];

export const streakMilestoneCopy = (n: number): Moment => {
  if (n >= 100) return { emoji: '🏆', title: `${n}-day streak`, body: 'This is legendary. You have built something real.' };
  if (n >= 30) return { emoji: '🌞', title: `${n}-day streak`, body: 'A whole month of rising. This is who you are now.' };
  if (n >= 14) return { emoji: '🔥', title: `${n}-day streak`, body: 'Two weeks strong. Habits are taking root.' };
  if (n >= 7) return { emoji: '🔥', title: 'One full week!', body: 'Seven days in a row. You are on fire.' };
  return { emoji: '✨', title: `${n} days in a row`, body: 'You are building momentum. Keep it gentle, keep it going.' };
};
