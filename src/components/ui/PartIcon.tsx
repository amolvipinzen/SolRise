import { Sparkles, Sun, Sunrise, Sunset } from 'lucide-react';
import { DayPartKey } from '../../lib/tasks';

const PARTS: Record<DayPartKey, { Icon: typeof Sun; color: string }> = {
  Morning: { Icon: Sunrise, color: '#E8960C' },
  Afternoon: { Icon: Sun, color: '#EA6A1F' },
  Evening: { Icon: Sunset, color: '#8B5CF6' },
  Anytime: { Icon: Sparkles, color: 'var(--t-faint)' },
};

// A small tinted line icon for each part of the day
export default function PartIcon({ part, className = 'w-4 h-4' }: { part: DayPartKey; className?: string }) {
  const { Icon, color } = PARTS[part];
  return <Icon className={`shrink-0 ${className}`} style={{ color }} strokeWidth={2.25} aria-hidden="true" />;
}
