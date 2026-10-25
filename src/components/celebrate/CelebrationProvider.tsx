import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Moment } from '../../lib/messages';
import { DayCompleteOverlay, LevelUpOverlay, StreakOverlay } from './Overlays';

export type Overlay =
  | { kind: 'day'; done: number; xp: number; streak: number; onReflect: (text: string) => void }
  | { kind: 'level'; level: number }
  | { kind: 'streak'; days: number };

export interface MomentOptions extends Moment {
  tone?: 'celebrate' | 'info';
  action?: { label: string; onClick: () => void };
}

interface Point {
  x: number;
  y: number;
}

interface CelebrationApi {
  burst: (origin: Point, count?: number) => void;
  shower: () => void;
  floatText: (origin: Point, text: string) => void;
  moment: (m: MomentOptions) => void;
  overlay: (o: Overlay) => void;
}

const CelebrationContext = createContext<CelebrationApi | null>(null);

export const useCelebrate = () => {
  const ctx = useContext(CelebrationContext);
  if (!ctx) throw new Error('useCelebrate must be used inside CelebrationProvider');
  return ctx;
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  color: string;
  shape: 'rect' | 'circle' | 'star';
  life: number;
  maxLife: number;
}

const themeColors = () => {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return [read('--t-primary', '#EE6332'), read('--t-accent', '#F2AE2E'), read('--t-success', '#2F9E6A'), '#FF8FB1', '#7CC6FF', '#FFD84D'];
};

const drawStar = (ctx: CanvasRenderingContext2D, r: number) => {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.45;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  ctx.closePath();
  ctx.fill();
};

let floatId = 0;

export default function CelebrationProvider({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const frame = useRef<number | null>(null);
  const [floats, setFloats] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
  const [current, setCurrent] = useState<(MomentOptions & { id: number }) | null>(null);
  const [queue, setQueue] = useState<Overlay[]>([]);
  const momentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== window.innerWidth * dpr || canvas.height !== window.innerHeight * dpr) {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.current = particles.current.filter(p => p.life < p.maxLife && p.y < window.innerHeight + 40);
    for (const p of particles.current) {
      p.life++;
      p.vy += 0.22;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      const fade = Math.min(1, (p.maxLife - p.life) / 25);
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'star') {
        drawStar(ctx, p.w * 0.7);
      } else {
        // Flip vertically over time to fake a 3D tumble
        ctx.scale(1, Math.cos(p.life * 0.15));
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }

    if (particles.current.length > 0) {
      frame.current = requestAnimationFrame(loop);
    } else {
      frame.current = null;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }, []);

  const spawn = useCallback((items: Particle[]) => {
    if (prefersReducedMotion()) return;
    particles.current.push(...items);
    if (frame.current === null) frame.current = requestAnimationFrame(loop);
  }, [loop]);

  const burst = useCallback((origin: Point, count = 36) => {
    const colors = themeColors();
    const shapes: Particle['shape'][] = ['rect', 'rect', 'circle', 'star'];
    spawn(Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 6;
      const size = 5 + Math.random() * 6;
      return {
        x: origin.x,
        y: origin.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        w: size,
        h: size * 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        life: 0,
        maxLife: 70 + Math.random() * 40,
      };
    }));
  }, [spawn]);

  const shower = useCallback(() => {
    const colors = themeColors();
    const w = window.innerWidth;
    spawn(Array.from({ length: 160 }, (_, i) => {
      const size = 6 + Math.random() * 7;
      const fromLeft = i % 2 === 0;
      return {
        x: fromLeft ? -10 : w + 10,
        y: window.innerHeight * (0.35 + Math.random() * 0.4),
        vx: (fromLeft ? 1 : -1) * (6 + Math.random() * 9),
        vy: -10 - Math.random() * 9,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.35,
        w: size,
        h: size * 0.55,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.random() < 0.2 ? 'star' : Math.random() < 0.3 ? 'circle' : 'rect',
        life: 0,
        maxLife: 150 + Math.random() * 60,
      };
    }));
  }, [spawn]);

  const floatText = useCallback((origin: Point, text: string) => {
    const id = ++floatId;
    const x = Math.min(Math.max(origin.x, 56), window.innerWidth - 56);
    setFloats(f => [...f, { id, x, y: origin.y, text }]);
    setTimeout(() => setFloats(f => f.filter(item => item.id !== id)), 1300);
  }, []);

  const moment = useCallback((m: MomentOptions) => {
    if (momentTimer.current) clearTimeout(momentTimer.current);
    setCurrent({ ...m, id: Date.now() });
    momentTimer.current = setTimeout(() => setCurrent(null), m.action ? 5500 : 4000);
  }, []);

  const overlay = useCallback((o: Overlay) => setQueue(q => [...q, o]), []);

  useEffect(() => () => {
    if (frame.current) cancelAnimationFrame(frame.current);
    if (momentTimer.current) clearTimeout(momentTimer.current);
  }, []);

  const activeOverlay = queue[0];
  const closeOverlay = () => setQueue(q => q.slice(1));

  // Celebrate each overlay as it appears
  useEffect(() => {
    if (activeOverlay) shower();
  }, [activeOverlay, shower]);

  const toneClass = current?.tone === 'info' ? 'bg-surface text-ink border border-line' : 'bg-ink text-bg';

  return (
    <CelebrationContext.Provider value={{ burst, shower, floatText, moment, overlay }}>
      {children}

      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-[300]" aria-hidden="true" />

      {/* Floating "+XP" labels */}
      <div className="fixed inset-0 pointer-events-none z-[301]" aria-hidden="true">
        <AnimatePresence>
          {floats.map(f => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 0, scale: 0.6 }}
              animate={{ opacity: [0, 1, 1, 0], y: -70, scale: [0.6, 1.15, 1, 1] }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 font-extrabold text-accent text-lg drop-shadow-sm whitespace-nowrap"
              style={{ left: f.x, top: f.y - 24 }}
            >
              {f.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Moment toast: the "we see you" message after every action */}
      <div className="fixed inset-x-0 bottom-[112px] md:bottom-8 z-[250] flex justify-center px-4 pointer-events-none">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.id}
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className={`pointer-events-auto w-full max-w-sm rounded-[22px] shadow-2xl px-4 py-3.5 flex items-center gap-3.5 ${toneClass}`}
              onClick={() => setCurrent(null)}
            >
              <motion.span
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: [0, 1.35, 1], rotate: [-30, 12, 0] }}
                transition={{ duration: 0.55, delay: 0.05 }}
                className="text-3xl leading-none shrink-0"
              >
                {current.emoji}
              </motion.span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[15px] leading-tight">{current.title}</div>
                {current.body && <div className="text-[13px] opacity-75 leading-snug mt-0.5">{current.body}</div>}
              </div>
              {current.action && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    current.action!.onClick();
                    setCurrent(null);
                  }}
                  className="shrink-0 px-3 py-1.5 rounded-full text-sm font-bold bg-primary text-on-primary press cursor-pointer"
                >
                  {current.action.label}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {activeOverlay?.kind === 'day' && <DayCompleteOverlay key="day" {...activeOverlay} onClose={closeOverlay} />}
        {activeOverlay?.kind === 'level' && <LevelUpOverlay key="level" level={activeOverlay.level} onClose={closeOverlay} />}
        {activeOverlay?.kind === 'streak' && <StreakOverlay key="streak" days={activeOverlay.days} onClose={closeOverlay} />}
      </AnimatePresence>
    </CelebrationContext.Provider>
  );
}
