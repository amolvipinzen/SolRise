import { ChangeEvent, ReactNode, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, Camera, Check, Copy, LogOut, Volume2, VolumeX } from 'lucide-react';
import { Circle, ThemeId, UserProfile } from '../../types';
import { THEMES } from '../../lib/themes';
import { levelTitle, XP_PER_LEVEL } from '../../lib/tasks';
import { soundEffects } from '../../utils/audio';
import Avatar from '../ui/Avatar';

interface MeViewProps {
  profile: UserProfile;
  circle: Circle | null;
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
  remindersOn: boolean;
  onToggleReminders: () => void;
  onLogout: () => void;
}

const AVATARS = ['🦊', '🦁', '🐯', '🐨', '🐼', '🐻', '🐱', '🐶', '🐰', '🦄', '🐸', '🐵', '🐧', '🦉', '🐢', '🌻', '🌞', '🌙'];

const Toggle = ({ on, onClick, label, icon, hint }: { on: boolean; onClick: () => void; label: string; icon: ReactNode; hint: string }) => (
  <button onClick={onClick} className="w-full flex items-center gap-3 py-3 text-left cursor-pointer" role="switch" aria-checked={on}>
    <span className="w-9 h-9 rounded-xl bg-subtle flex items-center justify-center text-muted shrink-0">{icon}</span>
    <span className="flex-1 min-w-0">
      <span className="block text-sm font-semibold text-ink">{label}</span>
      <span className="block text-xs text-muted">{hint}</span>
    </span>
    <span className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${on ? 'bg-primary' : 'bg-line'}`}>
      <motion.span layout className={`block w-5 h-5 rounded-full bg-white shadow ${on ? 'ml-auto' : ''}`} />
    </span>
  </button>
);

// Center-crop and shrink uploads so they fit comfortably in a Firestore document
const resizeImage = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 160;
        const ctx = canvas.getContext('2d')!;
        const min = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, 160, 160);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });

export default function MeView({ profile, circle, theme, onThemeChange, onUpdateProfile, remindersOn, onToggleReminders, onLogout }: MeViewProps) {
  const [muted, setMuted] = useState(soundEffects.isMuted());
  const [copied, setCopied] = useState(false);
  const [pickingAvatar, setPickingAvatar] = useState(false);

  const xpInLevel = profile.xp % XP_PER_LEVEL;
  const stats = [
    { label: 'Day streak', value: profile.dayStreak || 0, icon: '🔥' },
    { label: 'Best streak', value: Math.max(profile.bestStreak || 0, profile.dayStreak || 0), icon: '🏆' },
    { label: 'Wins', value: profile.tasksCompleted || 0, icon: '✅' },
    { label: 'Total XP', value: profile.xp, icon: '⭐' },
  ];

  const upload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await resizeImage(file);
      onUpdateProfile({ avatarUrl: url });
      setPickingAvatar(false);
    } catch (err) {
      console.error('Failed to read image:', err);
    }
  };

  const copyCode = async () => {
    if (!circle) return;
    try {
      await navigator.clipboard.writeText(circle.code);
      soundEffects.playTap();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div className="space-y-5">
      {/* Profile hero */}
      <section className="card p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setPickingAvatar(p => !p)} className="relative group cursor-pointer" aria-label="Change avatar">
            <Avatar user={profile} size={76} />
            <span className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center ring-2 ring-surface">
              <Camera className="w-3.5 h-3.5" />
            </span>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-semibold text-ink truncate">{profile.displayName}</h1>
            <p className="text-sm text-muted">
              Level {profile.level} · <span className="font-semibold text-primary">{levelTitle(profile.level)}</span>
            </p>
            <div className="h-2.5 bg-subtle rounded-full mt-2.5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(xpInLevel / XP_PER_LEVEL) * 100}%` }}
                transition={{ type: 'spring', stiffness: 60, damping: 16 }}
              />
            </div>
            <p className="text-xs text-muted mt-1">{XP_PER_LEVEL - xpInLevel} XP to {levelTitle(profile.level + 1)}</p>
          </div>
        </div>

        <AnimatePresence>
          {pickingAvatar && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="pt-5">
                <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5">
                  {AVATARS.map(a => (
                    <button
                      key={a}
                      onClick={() => {
                        soundEffects.playTap();
                        onUpdateProfile({ avatarEmoji: a, avatarUrl: null });
                      }}
                      className={`aspect-square rounded-2xl text-2xl flex items-center justify-center press cursor-pointer ${
                        !profile.avatarUrl && profile.avatarEmoji === a ? 'bg-primary-soft ring-2 ring-primary' : 'bg-subtle hover:bg-primary-soft'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-subtle text-sm font-semibold text-ink cursor-pointer hover:bg-primary-soft transition">
                    <Camera className="w-4 h-4" /> Upload a photo
                    <input type="file" accept="image/*" className="hidden" onChange={upload} />
                  </label>
                  {profile.avatarUrl && (
                    <button onClick={() => onUpdateProfile({ avatarUrl: null })} className="text-sm font-semibold text-danger cursor-pointer">
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-4 gap-2 mt-5">
          {stats.map(s => (
            <div key={s.label} className="bg-subtle rounded-2xl py-3 text-center">
              <div className="text-lg font-extrabold text-ink tabular-nums">{s.value.toLocaleString()}</div>
              <div className="text-[11px] font-semibold text-muted mt-0.5">
                {s.icon} {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Themes */}
      <section className="card p-5">
        <h2 className="font-semibold text-ink">Theme</h2>
        <p className="text-sm text-muted">Pick the mood that makes you want to come back.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
          {THEMES.map(t => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onThemeChange(t.id)}
                aria-pressed={active}
                className={`relative text-left rounded-2xl p-3 border-2 transition press cursor-pointer ${active ? 'border-primary' : 'border-line hover:border-primary/40'}`}
                style={{ background: t.swatch[0] }}
              >
                <div className="flex gap-1">
                  <span className="w-6 h-6 rounded-full" style={{ background: t.swatch[1] }} />
                  <span className="w-6 h-6 rounded-full -ml-2.5 ring-2" style={{ background: t.swatch[2], ['--tw-ring-color' as string]: t.swatch[0] }} />
                </div>
                <div className="mt-3 text-sm font-bold" style={{ color: t.id === 'midnight' ? '#EEEDFF' : '#1d1d1d' }}>
                  {t.name}
                </div>
                <div className="text-[11px]" style={{ color: t.id === 'midnight' ? '#A9A8CF' : '#6b6b6b' }}>
                  {t.tagline}
                </div>
                {active && (
                  <motion.span
                    layoutId="theme-check"
                    className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-white"
                    style={{ background: t.swatch[1] }}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Preferences */}
      <section className="card px-5 py-2 divide-y divide-line">
        <Toggle
          on={!muted}
          onClick={() => {
            soundEffects.setMuted(!muted);
            setMuted(!muted);
            if (muted) soundEffects.playTap();
          }}
          label="Sounds"
          hint="Soft chimes when you complete things"
          icon={muted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
        />
        <Toggle
          on={remindersOn}
          onClick={onToggleReminders}
          label="Reminders"
          hint="A gentle nudge at each task's time, while SolRise is open"
          icon={<Bell className="w-4.5 h-4.5" />}
        />
      </section>

      {circle && (
        <section className="card p-5">
          <h2 className="font-semibold text-ink">Your circle</h2>
          <p className="text-sm text-muted">{circle.name}</p>
          <button
            onClick={copyCode}
            className="mt-3 w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border-2 border-dashed border-line hover:border-primary transition cursor-pointer"
          >
            <span className="font-mono font-bold tracking-wider text-ink">{circle.code}</span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy invite'}
            </span>
          </button>
        </section>
      )}

      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-danger bg-danger-soft press cursor-pointer"
      >
        <LogOut className="w-4 h-4" /> Sign out
      </button>
    </div>
  );
}
