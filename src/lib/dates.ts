// Local-time date helpers. All "day keys" are YYYY-MM-DD in the user's own timezone.

export const dayKey = (d: Date = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const parseDayKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (d: Date, n: number) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
};

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// Weeks start on Monday
export const startOfWeek = (d: Date) => {
  const s = startOfDay(d);
  const offset = (s.getDay() + 6) % 7;
  return addDays(s, -offset);
};

export const daysBetween = (a: Date, b: Date) =>
  Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86_400_000);

export const isSameDay = (a: Date, b: Date) => dayKey(a) === dayKey(b);
export const isSameWeek = (a: Date, b: Date) => isSameDay(startOfWeek(a), startOfWeek(b));
export const isSameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

// ISO week number (weeks start Monday; week 1 contains the year's first Thursday)
export const weekOfYear = (d: Date = new Date()) => {
  const thursday = addDays(startOfWeek(d), 3);
  const firstThursdayWeek = startOfWeek(new Date(thursday.getFullYear(), 0, 4));
  return Math.round(daysBetween(firstThursdayWeek, startOfWeek(d)) / 7) + 1;
};

export type DayPart = 'dawn' | 'day' | 'dusk' | 'night';

export const dayPart = (d: Date = new Date()): DayPart => {
  const h = d.getHours();
  if (h >= 5 && h < 10) return 'dawn';
  if (h >= 10 && h < 17) return 'day';
  if (h >= 17 && h < 21) return 'dusk';
  return 'night';
};

export const greeting = (d: Date = new Date()) => {
  const h = d.getHours();
  if (h < 5) return 'Still up';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
};

export const relativeTime = (iso: string, now: Date = new Date()) => {
  const diff = Math.max(0, now.getTime() - new Date(iso).getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const friendlyDate = (key: string, now: Date = new Date()) => {
  const d = parseDayKey(key);
  const diff = daysBetween(now, d);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff < 0) return `${-diff}d overdue`;
  if (diff < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};
