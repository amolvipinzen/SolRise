import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { ListChecks, Plus, Sun, User, Users } from 'lucide-react';
import { UserProfile } from '../types';
import { soundEffects } from '../utils/audio';
import Avatar from './ui/Avatar';

export type Tab = 'today' | 'plan' | 'family' | 'me';

interface AppShellProps {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  onNewTask: () => void;
  profile: UserProfile;
  children: ReactNode;
}

const NAV: { key: Tab; label: string; icon: typeof Sun }[] = [
  { key: 'today', label: 'Today', icon: Sun },
  { key: 'plan', label: 'Plan', icon: ListChecks },
  { key: 'family', label: 'Family', icon: Users },
  { key: 'me', label: 'Me', icon: User },
];

export const Logo = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg viewBox="0 0 32 32" className="w-8 h-8" aria-hidden="true">
      <defs>
        <linearGradient id="logo-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD86B" />
          <stop offset="1" stopColor="#FF7A45" />
        </linearGradient>
      </defs>
      <path d="M4 22a12 12 0 0 1 24 0Z" fill="url(#logo-sun)" />
      {[-60, -30, 0, 30, 60].map(a => (
        <rect key={a} x="15" y="2" width="2" height="5" rx="1" fill="#FFB347" transform={`rotate(${a} 16 22)`} />
      ))}
      <rect x="2" y="24" width="28" height="2.5" rx="1.25" fill="currentColor" opacity="0.35" />
    </svg>
    <span className="font-display text-xl font-semibold text-ink tracking-tight">SolRise</span>
  </div>
);

export default function AppShell({ tab, onTabChange, onNewTask, profile, children }: AppShellProps) {
  const go = (t: Tab) => {
    if (t !== tab) soundEffects.playTap();
    onTabChange(t);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen ambient">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 lg:w-64 flex-col gap-1 p-5 border-r border-line bg-surface/70 backdrop-blur-xl z-40">
        <Logo className="px-2 mb-6 text-primary" />
        {NAV.map(n => {
          const active = tab === n.key;
          const Icon = n.icon;
          return (
            <button
              key={n.key}
              onClick={() => go(n.key)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[15px] font-semibold transition-colors cursor-pointer ${
                active ? 'text-primary' : 'text-muted hover:text-ink hover:bg-subtle'
              }`}
            >
              {active && <motion.span layoutId="side-pill" className="absolute inset-0 rounded-2xl bg-primary-soft" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
              <Icon className="relative w-5 h-5" />
              <span className="relative">{n.label}</span>
            </button>
          );
        })}
        <button
          onClick={onNewTask}
          className="mt-4 flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-on-primary font-bold glow-primary press cursor-pointer"
        >
          <Plus className="w-5 h-5" /> New task
        </button>
        <div className="flex-1" />
        <button onClick={() => go('me')} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-subtle transition cursor-pointer text-left">
          <Avatar user={profile} size={36} />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink truncate">{profile.displayName}</div>
            <div className="text-xs text-muted">Level {profile.level} · {profile.xp} XP</div>
          </div>
        </button>
      </aside>

      {/* Main content */}
      <main className="md:pl-60 lg:pl-64">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 pb-32 md:pb-16">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Mobile bottom navigation, with the add button raised in the centre */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 pb-safe" aria-label="Main">
        <div className="relative bg-surface/90 backdrop-blur-xl border-t border-line">
          <div className="grid grid-cols-5 h-[68px]">
            {[NAV[0], NAV[1], null, NAV[2], NAV[3]].map((n, i) => {
              if (!n) {
                return (
                  <div key="add" className="relative flex justify-center">
                    <motion.button
                      onClick={onNewTask}
                      whileTap={{ scale: 0.88, rotate: 90 }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                      className="absolute -top-5 w-[52px] h-[52px] rounded-full bg-gradient-to-b from-primary to-primary-strong text-on-primary flex items-center justify-center glow-primary ring-4 ring-bg cursor-pointer"
                      aria-label="New task"
                    >
                      <Plus className="w-6 h-6" strokeWidth={2.75} />
                    </motion.button>
                    <span className="absolute bottom-2.5 text-[11px] font-bold text-faint">Add</span>
                  </div>
                );
              }
              const active = tab === n.key;
              const Icon = n.icon;
              return (
                <button
                  key={n.key + i}
                  onClick={() => go(n.key)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer transition-colors ${active ? 'text-primary' : 'text-faint'}`}
                >
                  {active && <motion.span layoutId="bottom-pill" className="absolute top-2 w-12 h-8 rounded-full bg-primary-soft" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                  <Icon className="relative w-5 h-5 mt-0.5" strokeWidth={active ? 2.5 : 2} />
                  <span className="relative">{n.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
