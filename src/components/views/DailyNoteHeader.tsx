import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { weekOfYear } from '../../lib/dates';
import { dailyQuote } from '../../lib/messages';

// A doodled sun, as if sketched in the corner of the page with the theme's pen
const SunDoodle = () => (
  <motion.svg
    viewBox="0 0 64 64"
    className="w-12 h-12 text-primary shrink-0"
    animate={{ rotate: [0, 8, 0] }}
    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    aria-hidden="true"
  >
    <path d="M32 21c6.5-.4 11.3 4.6 11 11.2-.3 6.2-5.4 10.6-11.4 10.4-6.1-.2-10.8-5.2-10.5-11.3.3-5.8 4.9-10 10.9-10.3z" fill="var(--t-accent-soft)" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
      <path
        key={a}
        d={i % 2 ? 'M32 10.5 L32.6 4.5' : 'M31.6 11 Q 33 7.5 31.8 3'}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        transform={`rotate(${a} 32 32)`}
      />
    ))}
    <path d="M27.5 31.5q1 1.6 2 0M34.5 31.5q1 1.6 2 0M28.5 35.5q3.5 3 7 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
  </motion.svg>
);

interface DailyNoteHeaderProps {
  intention?: string;
  aside?: ReactNode;
}

// Planner-style header for today's page: a big handwritten date, the day's focus, and a thought for the day
export default function DailyNoteHeader({ intention, aside }: DailyNoteHeaderProps) {
  const now = new Date();
  return (
    <header className="relative page-text pb-4 ruled-line">
      <span className="washi -top-[30px] left-[44%] w-24 rotate-[4deg]" aria-hidden="true" />

      <div className="flex items-center gap-3">
        <span className="font-script text-[64px] leading-[0.75] font-bold text-primary tabular-nums">{now.getDate()}</span>
        <div className="min-w-0">
          <div className="font-script text-[30px] leading-none font-bold text-ink">
            {now.toLocaleDateString([], { weekday: 'long' })}
          </div>
          <div className="font-hand text-[15px] text-muted mt-0.5 whitespace-nowrap">
            {now.toLocaleDateString([], { month: 'short', year: 'numeric' })} · week {weekOfYear(now)}
          </div>
        </div>
        <span className="flex-1" />
        <SunDoodle />
      </div>

      {intention && (
        <div className="mt-4">
          <div className="font-hand text-[13px] uppercase tracking-[0.18em] text-faint">Today I will</div>
          <div className="font-hand text-[21px] leading-snug text-ink">
            <span className="bg-[linear-gradient(transparent_60%,var(--t-accent-soft)_60%)] px-0.5">{intention}</span>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        {/* Sticky note with the thought for the day */}
        <motion.figure
          initial={{ rotate: -4, y: -6, opacity: 0 }}
          animate={{ rotate: -1.5, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.15 }}
          className="relative max-w-[17rem] bg-accent-soft px-4 pt-4 pb-3 rounded-[3px] shadow-[2px_4px_10px_-4px_rgb(0_0_0/0.25)]"
        >
          <span className="washi washi-accent -top-2.5 left-1/2 -translate-x-1/2 w-14 rotate-[-6deg] h-[18px]" aria-hidden="true" />
          <figcaption className="font-hand text-[12px] uppercase tracking-[0.16em] text-muted">Thought for today</figcaption>
          <blockquote className="font-hand text-[17px] leading-snug text-ink mt-1">{dailyQuote(now)}</blockquote>
        </motion.figure>
        {aside}
      </div>
    </header>
  );
}
