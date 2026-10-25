import { motion } from 'motion/react';

interface SunProgressProps {
  done: number;
  total: number;
  size?: number;
}

// A ring that fills as the day's tasks get done, with a sun that grows brighter toward 100%
export default function SunProgress({ done, total, size = 116 }: SunProgressProps) {
  const progress = total === 0 ? 0 : done / total;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const complete = total > 0 && done >= total;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#FFF4C2"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - progress) }}
          transition={{ type: 'spring', stiffness: 60, damping: 16 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          className="rounded-full bg-gradient-to-b from-[#FFF6C4] to-[#FFC246]"
          initial={false}
          animate={{
            width: size * (0.3 + progress * 0.14),
            height: size * (0.3 + progress * 0.14),
            boxShadow: `0 0 ${10 + progress * 30}px ${progress * 10}px rgba(255, 214, 100, ${0.35 + progress * 0.4})`,
          }}
          transition={{ type: 'spring', stiffness: 80, damping: 14 }}
        />
        <div className="absolute bottom-[18%] text-[11px] font-bold text-white drop-shadow">
          {total === 0 ? '—' : complete ? 'Done!' : `${done}/${total}`}
        </div>
      </div>
      <span className="sr-only">
        {done} of {total} tasks done today
      </span>
    </div>
  );
}
