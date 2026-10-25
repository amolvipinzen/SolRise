export type ThemeId = 'sunrise' | 'lavender' | 'ocean' | 'forest' | 'midnight';

export interface DailyCheckin {
  date: string; // YYYY-MM-DD (local)
  mood?: string;
  intention?: string;
  reflection?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  avatarEmoji: string;
  avatarUrl?: string | null;
  role: 'Parent' | 'Child' | 'Grandparent' | 'Other';
  circleId: string | null;
  xp: number;
  level: number;
  pushToken: string; // generated upon login for push notifications simulation
  createdAt: string;
  theme?: ThemeId;
  dayStreak?: number; // consecutive days with at least one completion
  bestStreak?: number;
  lastActiveDate?: string; // YYYY-MM-DD of last completion
  activeDays?: string[]; // recent YYYY-MM-DD days with completions
  tasksCompleted?: number;
  bonusDate?: string; // last day the full-day bonus was awarded
  checkin?: DailyCheckin;
}

export interface Circle {
  id: string;
  name: string;
  code: string; // invite code like FAM-123456
  createdById: string;
  createdAt: string;
}

export type TaskCategory = 'Chore' | 'Routine' | 'Exercise' | 'Goal';
export type TaskFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'One-time';
export type TaskDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  frequency: TaskFrequency;
  assignedTo: string[]; // array of user UIDs
  timeOfDay?: string | null; // HH:MM e.g. "18:00"
  deadlineDate?: string | null; // specific due date (YYYY-MM-DD)
  xpReward: number;
  difficulty: TaskDifficulty;
  status: 'Pending' | 'Completed';
  lastCompletedAt?: string | null;
  lastCompletedBy?: string | null;
  streak: number;
  createdById: string;
  createdAt: string;
  order?: number;
  emoji?: string | null;
  completionCount?: number;
  // Snapshot taken on completion so an undo can restore the previous state
  prevCompletedAt?: string | null;
  prevStreak?: number;
  isRecurring?: boolean;
  recurrenceInterval?: number | null;
  recurrenceDurationType?: 'indefinite' | 'occurrences' | 'date' | null;
  recurrenceDurationValue?: number | null;
  recurrenceEndDate?: string | null;
}

export type TaskDraft = Omit<Task, 'id' | 'status' | 'streak' | 'createdAt' | 'createdById'>;

export interface TaskLog {
  id: string;
  taskId: string;
  taskTitle: string;
  taskCategory: TaskCategory;
  completedBy: string; // user UID
  completedByName: string; // cached name
  completedByEmoji: string; // cached emoji
  xpAwarded: number;
  completedAt: string;
}
