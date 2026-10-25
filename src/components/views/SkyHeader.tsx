import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Flame } from 'lucide-react';
import { dayPart, greeting } from '../../lib/dates';
import { levelTitle } from '../../lib/tasks';
import SunProgress from '../ui/SunProgress';

interface SkyHeaderProps {
  name: string;
  done: number;
  total: number;
  dayStreak: number;
  level: number;
}

const STARS = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 53) % 100,
  top: (i * 37) % 70,
  size: 1 + (i % 3),
  delay: (i % 6) * 0.4,
}));

export default function SkyHeader({ name, done, total, dayStreak, level }: SkyHeaderProps) {
  // Re-render every minute so the sky follows the real time of day
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const part = dayPart(now);
  const firstName = name.split(' ')[0];
  const remaining = total - done;

  const status =
    total === 0
      ? 'A fresh page. What would make today good?'
      : remaining === 0
        ? 'Everything done. You showed up today. ☀️'
        : done === 0
          ? `${total} small ${total === 1 ? 'step' : 'steps'} for today. Start with the easiest.`
          : `${remaining} to go. You are ${Math.round((done / total) * 100)}% risen.`;

  return (
    <section className={`relative overflow-hidden rounded-[32px] sky-${part} text-white p-5 sm:p-7 shadow-lg`}>
      {/* Decorations per time of day */}
      {part === 'night' &&
        STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
          />
        ))}
      {part === 'day' && (
        <>
          <div className="absolute top-6 w-24 h-8 bg-white/40 rounded-full blur-md animate-drift" />
          <div className="absolute top-16 w-32 h-10 bg-white/30 rounded-full blur-md animate-drift" style={{ animationDelay: '-25s' }} />
        </>
      )}
      <div className="absolute -bottom-16 -left-10 w-72 h-40 rounded-[50%] bg-white/10" />
      <div className="absolute -bottom-20 right-0 w-80 h-40 rounded-[50%] bg-white/10" />

      <div className="relative flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold text-white/85"
          >
            {now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-display text-[26px] sm:text-4xl font-semibold leading-tight mt-1 drop-shadow-sm"
          >
            {greeting(now)}, {firstName}
          </motion.h1>
          <p className="text-[15px] text-white/90 mt-2 leading-snug">{status}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 fill-current" />
              {dayStreak > 0 ? `${dayStreak}-day streak` : 'Start a streak today'}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold">
              Lv {level} · {levelTitle(level)}
            </span>
          </div>
        </div>
        <SunProgress done={done} total={total} size={104} />
      </div>

    </section>
  );
}
