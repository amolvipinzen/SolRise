import { ReactNode, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { levelTitle } from '../../lib/tasks';
import { streakMilestoneCopy } from '../../lib/messages';

const Backdrop = ({ children, onClose, className }: { children: ReactNode; onClose: () => void; className: string }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className={`fixed inset-0 z-[280] flex items-center justify-center p-5 overflow-y-auto ${className}`}
    >
      {children}
    </motion.div>
  );
};

const Rays = ({ color }: { color: string }) => (
  <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full animate-spin-slow" aria-hidden="true">
    {Array.from({ length: 12 }).map((_, i) => (
      <path
        key={i}
        d="M100 100 L94 0 L106 0 Z"
        fill={color}
        opacity={0.35}
        transform={`rotate(${i * 30} 100 100)`}
      />
    ))}
  </svg>
);

// Counts up from 0 so numbers feel earned
const CountUp = ({ to, duration = 900 }: { to: number; duration?: number }) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <>{value}</>;
};

const REFLECTION_WORDS = ['Proud', 'Grateful', 'Calm', 'Productive', 'Tired', 'Happy'];

export function DayCompleteOverlay({
  done,
  xp,
  streak,
  onReflect,
  onClose,
}: {
  done: number;
  xp: number;
  streak: number;
  onReflect: (text: string) => void;
  onClose: () => void;
}) {
  const [word, setWord] = useState('');

  const finish = () => {
    if (word.trim()) onReflect(word.trim());
    onClose();
  };

  return (
    <Backdrop onClose={onClose} className="sky-dawn">
      <div className="w-full max-w-sm text-center text-white">
        {/* Sun rising over the horizon */}
        <div className="relative mx-auto w-64 h-36 overflow-hidden">
          <motion.div
            initial={{ y: 110 }}
            animate={{ y: 18 }}
            transition={{ duration: 1.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute left-1/2 -translate-x-1/2 w-56 h-56"
          >
            <Rays color="#FFF6C9" />
            <div className="absolute inset-[30%] rounded-full bg-gradient-to-b from-[#FFF3B0] to-[#FFC24B] shadow-[0_0_60px_20px_rgba(255,220,120,0.6)]" />
          </motion.div>
          <div className="absolute bottom-0 inset-x-0 h-px bg-white/70" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h2 className="font-display text-3xl font-semibold mt-5 drop-shadow-sm">Your day has fully risen</h2>
          <p className="text-white/85 text-sm mt-2">
            Everything on today's list is done. Take a breath and enjoy this.
          </p>

          <div className="grid grid-cols-3 gap-2 mt-6">
            {[
              { label: 'done', value: done, icon: '✅' },
              { label: 'XP today', value: xp, icon: '⭐' },
              { label: 'day streak', value: streak, icon: '🔥' },
            ].map(s => (
              <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-2xl py-3 border border-white/20">
                <div className="text-2xl font-extrabold">
                  <CountUp to={s.value} />
                </div>
                <div className="text-[11px] font-semibold text-white/80 mt-0.5">{s.icon} {s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-left">
            <label htmlFor="reflection" className="text-sm font-semibold text-white/90">
              One word for today?
            </label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {REFLECTION_WORDS.map(w => (
                <button
                  key={w}
                  onClick={() => setWord(w)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition press cursor-pointer ${
                    word === w ? 'bg-white text-[#B5487A]' : 'bg-white/15 text-white border border-white/25 hover:bg-white/25'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
            <input
              id="reflection"
              value={word}
              onChange={e => setWord(e.target.value)}
              placeholder="or write your own…"
              maxLength={40}
              className="mt-2 w-full bg-white/15 border border-white/25 rounded-xl px-3.5 py-2.5 text-sm placeholder:text-white/60 focus:outline-none focus:bg-white/25"
            />
          </div>

          <button
            onClick={finish}
            className="mt-6 w-full py-3.5 rounded-2xl bg-white text-[#B5487A] font-bold text-base press cursor-pointer shadow-lg"
          >
            {word.trim() ? 'Save & rest well' : 'Rest well ✨'}
          </button>
        </motion.div>
      </div>
    </Backdrop>
  );
}

export function LevelUpOverlay({ level, onClose }: { level: number; onClose: () => void }) {
  return (
    <Backdrop onClose={onClose} className="bg-[radial-gradient(circle_at_50%_40%,#3B2A7A,#120E2B)]">
      <div className="w-full max-w-sm text-center text-white">
        <div className="relative mx-auto w-60 h-60">
          <Rays color="#FFD66B" />
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.15 }}
            className="absolute inset-[22%] rounded-[32%] bg-gradient-to-br from-[#FFE48A] via-[#FFB938] to-[#F07B2B] flex items-center justify-center shadow-[0_0_50px_10px_rgba(255,190,80,0.45)] rotate-45"
          >
            <span className="-rotate-45 font-display text-6xl font-bold text-[#5A2A06]">{level}</span>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#FFD66B]">Level up</div>
          <h2 className="font-display text-4xl font-semibold mt-2">{levelTitle(level)}</h2>
          <p className="text-white/75 text-sm mt-3 max-w-xs mx-auto">
            Every small thing you did got you here. You are growing, one day at a time.
          </p>
          <button
            onClick={onClose}
            className="mt-8 w-full py-3.5 rounded-2xl bg-[#FFD66B] text-[#3B2A06] font-bold text-base press cursor-pointer"
          >
            Keep rising
          </button>
        </motion.div>
      </div>
    </Backdrop>
  );
}

export function StreakOverlay({ days, onClose }: { days: number; onClose: () => void }) {
  const copy = streakMilestoneCopy(days);
  return (
    <Backdrop onClose={onClose} className="bg-[radial-gradient(circle_at_50%_40%,#FF7A3D,#7A1E2C)]">
      <div className="w-full max-w-sm text-center text-white">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ duration: 0.7 }}
          className="text-[110px] leading-none"
        >
          <motion.span
            className="inline-block"
            animate={{ scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
          >
            🔥
          </motion.span>
        </motion.div>
        <div className="font-display text-7xl font-bold mt-2">
          <CountUp to={days} />
        </div>
        <div className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">day streak</div>
        <h2 className="font-display text-2xl font-semibold mt-5">{copy.title}</h2>
        <p className="text-white/80 text-sm mt-2">{copy.body}</p>
        <button
          onClick={onClose}
          className="mt-8 w-full py-3.5 rounded-2xl bg-white text-[#B2332A] font-bold text-base press cursor-pointer"
        >
          Let's keep it going
        </button>
      </div>
    </Backdrop>
  );
}
