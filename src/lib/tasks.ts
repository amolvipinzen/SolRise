import { Task, TaskCategory, TaskDifficulty, TaskFrequency } from '../types';
import { dayKey, daysBetween, isSameDay, isSameMonth, isSameWeek } from './dates';

export const XP_PER_LEVEL = 150;
export const FULL_DAY_BONUS = 25;

export const levelForXp = (xp: number) => Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;

export const LEVEL_TITLES = [
  'First Light', 'Early Riser', 'Steady Glow', 'Morning Star', 'Bright Spark',
  'Daybreaker', 'Sunkeeper', 'Golden Hour', 'High Noon', 'Radiant',
];
export const levelTitle = (level: number) => LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length) - 1];

export const calculateXp = (difficulty: TaskDifficulty, frequency: TaskFrequency) => {
  let base = difficulty === 'Hard' ? 40 : difficulty === 'Medium' ? 20 : 10;
  if (frequency === 'Weekly') base += 10;
  if (frequency === 'Monthly') base += 25;
  return base;
};

export const CATEGORY_META: Record<TaskCategory, { emoji: string; label: string; hint: string }> = {
  Chore: { emoji: '🧹', label: 'Home', hint: 'Keep your space feeling good' },
  Routine: { emoji: '🌱', label: 'Routine', hint: 'Small habits that add up' },
  Exercise: { emoji: '🏃', label: 'Move', hint: 'Energy for body and mind' },
  Goal: { emoji: '🎯', label: 'Goal', hint: 'A step toward something bigger' },
};

export const FREQUENCY_LABEL: Record<TaskFrequency, string> = {
  Daily: 'Every day',
  Weekly: 'Every week',
  Monthly: 'Every month',
  'One-time': 'Just once',
};

// Picks a fitting emoji from the words in a title, so new tasks look alive without effort
const EMOJI_KEYWORDS: [RegExp, string][] = [
  [/water|drink|hydrat/i, '💧'],
  [/plant|garden/i, '🪴'],
  [/walk|step/i, '🚶'],
  [/run|jog/i, '🏃'],
  [/gym|workout|lift|weights/i, '🏋️'],
  [/yoga|stretch/i, '🧘'],
  [/meditat|breath|calm/i, '🧘'],
  [/read|book/i, '📖'],
  [/study|homework|learn|class/i, '📚'],
  [/write|journal|diary/i, '✍️'],
  [/clean|tidy|vacuum|sweep|mop|dust/i, '🧹'],
  [/dish/i, '🍽️'],
  [/laundry|clothes|wash/i, '🧺'],
  [/cook|dinner|lunch|breakfast|meal/i, '🍳'],
  [/grocer|shop/i, '🛒'],
  [/trash|garbage|bin|recycl/i, '🗑️'],
  [/bill|pay|bank|budget|money/i, '💳'],
  [/call|phone/i, '📞'],
  [/email|inbox/i, '📧'],
  [/sleep|bed|nap/i, '😴'],
  [/vitamin|medic|pill/i, '💊'],
  [/dog|pet|cat|feed/i, '🐾'],
  [/car/i, '🚗'],
  [/bike|cycl/i, '🚴'],
  [/swim/i, '🏊'],
  [/music|piano|guitar|practice/i, '🎵'],
  [/teeth|brush|floss/i, '🪥'],
  [/family|kids|mom|dad/i, '👨‍👩‍👧'],
  [/plan|tomorrow|schedule/i, '🗓️'],
  [/work|project|meeting/i, '💼'],
  [/gratitude|thank/i, '🙏'],
];

export const suggestEmoji = (title: string): string | null => {
  for (const [re, emoji] of EMOJI_KEYWORDS) if (re.test(title)) return emoji;
  return null;
};

const LEADING_EMOJI = /^(\p{Extended_Pictographic}(‍\p{Extended_Pictographic}|️)*)\s*/u;

// Older tasks embed an emoji in the title; split it out so it can be shown as an icon
export const taskIcon = (task: Pick<Task, 'emoji' | 'title' | 'category'>) => {
  if (task.emoji) return task.emoji;
  const match = task.title.match(LEADING_EMOJI);
  if (match) return match[1];
  return CATEGORY_META[task.category].emoji;
};

export const taskTitle = (task: Pick<Task, 'emoji' | 'title'>) => task.title.replace(LEADING_EMOJI, '');

// A task is "done" only for its current period, so routines come back fresh each day/week/month
export const isDoneNow = (task: Task, now: Date = new Date()) => {
  if (task.frequency === 'One-time') return task.status === 'Completed';
  if (task.status !== 'Completed' || !task.lastCompletedAt) return false;
  const last = new Date(task.lastCompletedAt);
  if (task.frequency === 'Daily') return isSameDay(last, now);
  if (task.frequency === 'Weekly') return isSameWeek(last, now);
  return isSameMonth(last, now);
};

export const completedToday = (task: Task, now: Date = new Date()) =>
  !!task.lastCompletedAt && task.status === 'Completed' && isSameDay(new Date(task.lastCompletedAt), now);

// Recurring tasks with an end condition retire once it has passed
export const isRetired = (task: Task, now: Date = new Date()) => {
  if (task.frequency === 'One-time') return false;
  if (task.recurrenceDurationType === 'date' && task.recurrenceEndDate) {
    return dayKey(now) > task.recurrenceEndDate && !completedToday(task, now);
  }
  if (task.recurrenceDurationType === 'occurrences' && task.recurrenceDurationValue) {
    return (task.completionCount || 0) >= task.recurrenceDurationValue && !isDoneNow(task, now);
  }
  return false;
};

// Belongs on today's page: daily routines due today, plus one-offs due today/overdue/undated
export const isForToday = (task: Task, now: Date = new Date()) => {
  if (isRetired(task, now)) return false;
  if (task.frequency === 'Daily') {
    if (isDoneNow(task, now)) return true;
    const interval = task.recurrenceInterval || 1;
    if (interval <= 1 || !task.lastCompletedAt) return true;
    return daysBetween(new Date(task.lastCompletedAt), now) >= interval;
  }
  if (task.frequency === 'One-time') {
    if (task.status === 'Completed') return completedToday(task, now);
    return !task.deadlineDate || task.deadlineDate <= dayKey(now);
  }
  return false;
};

// Only a missed deadline counts as overdue; a daily habit is never "late", just still open
export const isOverdue = (task: Task, now: Date = new Date()) =>
  !isDoneNow(task, now) && !!task.deadlineDate && task.deadlineDate < dayKey(now);

export const isAssignedTo = (task: Task, uid: string) =>
  !task.assignedTo || task.assignedTo.length === 0 || task.assignedTo.includes(uid);

// Tasks are planned by part of day rather than clock time; each part is stored as a representative time
export type DayPartKey = 'Morning' | 'Afternoon' | 'Evening' | 'Anytime';
export const DAY_PARTS: DayPartKey[] = ['Morning', 'Afternoon', 'Evening', 'Anytime'];
export const PART_TIME: Record<DayPartKey, string | null> = { Morning: '08:00', Afternoon: '13:00', Evening: '19:00', Anytime: null };

export const partOf = (task: Pick<Task, 'timeOfDay'>): DayPartKey => {
  if (!task.timeOfDay) return 'Anytime';
  const hour = Number(task.timeOfDay.slice(0, 2));
  return hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
};

// Timed tasks first (by time), then untimed by creation order
export const byTime = (a: Task, b: Task) => {
  const ta = a.timeOfDay || '99:99';
  const tb = b.timeOfDay || '99:99';
  if (ta !== tb) return ta < tb ? -1 : 1;
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
};

export const recurrenceLabel = (task: Task) => {
  if (task.frequency === 'One-time') {
    return task.deadlineDate ? null : 'Once';
  }
  const n = task.recurrenceInterval || 1;
  const unit = task.frequency === 'Daily' ? 'day' : task.frequency === 'Weekly' ? 'week' : 'month';
  return n === 1 ? `Every ${unit}` : `Every ${n} ${unit}s`;
};

export const streakUnit = (frequency: TaskFrequency) =>
  frequency === 'Daily' ? 'days' : frequency === 'Weekly' ? 'weeks' : 'months';

// Did this completion continue the previous one, given the task's rhythm?
export const continuesStreak = (task: Task, now: Date = new Date()) => {
  if (!task.lastCompletedAt || task.frequency === 'One-time') return false;
  const last = new Date(task.lastCompletedAt);
  const interval = task.recurrenceInterval || 1;
  if (task.frequency === 'Daily') return daysBetween(last, now) <= interval;
  if (task.frequency === 'Weekly') return daysBetween(last, now) <= 7 * interval + 3;
  return daysBetween(last, now) <= 31 * interval + 9;
};

