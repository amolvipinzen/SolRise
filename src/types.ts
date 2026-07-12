export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  avatarEmoji: string;
  role: 'Parent' | 'Child' | 'Grandparent' | 'Other';
  circleId: string | null;
  xp: number;
  level: number;
  pushToken: string; // generated upon login for push notifications simulation
  createdAt: string;
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
  timeOfDay?: string; // HH:MM deadline e.g. "18:00"
  deadlineDate?: string; // specific due date (YYYY-MM-DD)
  xpReward: number;
  difficulty: TaskDifficulty;
  status: 'Pending' | 'Completed';
  lastCompletedAt?: string;
  lastCompletedBy?: string;
  streak: number;
  createdById: string;
  createdAt: string;
}

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

export interface FamilyBadge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  xpThreshold?: number;
  choreThreshold?: number;
  streakThreshold?: number;
}
