import { motion } from 'motion/react';
import { addDays, dayKey, startOfWeek } from '../../lib/dates';

interface WeekRhythmProps {
  activeDays: string[];
  dayStreak: number;
  bestStreak: number;
}

const LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Seven suns for the current week: lit on days with at least one win
export default function WeekRhythm({ activeDays, dayStreak, bestStreak }: WeekRhythmProps) {
  const now = new Date();
  const todayKey = dayKey(now);
  const monday = startOfWeek(now);
  const days = LETTERS.map((letter, i) => {
    const key = dayKey(addDays(monday, i));
    return { letter, key, active: activeDays.includes(key), isToday: key === todayKey, isFuture: key > todayKey };
  });
  const activeCount = days.filter(d => d.active).length;

  return (
    <section className="card p-4 sm:p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold text-ink">Your week</h2>
        <span className="text-xs font-semibold text-muted">
          {activeCount}/7 days · best streak {Math.max(bestStreak, dayStreak)}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1.5 mt-3">
        {days.map((d, i) => (
          <div key={d.key} className="flex flex-col items-center gap-1.5">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base ${
                d.active
                  ? 'bg-gradient-to-b from-[#FFE58A] to-[#FFB93B] shadow-[0_4px_14px_-4px_rgba(255,170,40,0.7)]'
                  : d.isFuture
                    ? 'border-2 border-dashed border-line'
                    : 'bg-subtle'
              } ${d.isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface' : ''}`}
            >
              {d.active ? '☀️' : ''}
            </motion.div>
            <span className={`text-[11px] font-bold ${d.isToday ? 'text-primary' : 'text-faint'}`}>{d.letter}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
