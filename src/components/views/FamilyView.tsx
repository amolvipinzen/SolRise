import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Flame, Share2 } from 'lucide-react';
import { Circle, TaskLog, UserProfile } from '../../types';
import { dayKey, friendlyDate, relativeTime, startOfWeek } from '../../lib/dates';
import { CATEGORY_META, levelTitle } from '../../lib/tasks';
import { soundEffects } from '../../utils/audio';
import Avatar from '../ui/Avatar';

interface FamilyViewProps {
  circle: Circle | null;
  members: UserProfile[];
  logs: TaskLog[];
  currentUserId: string;
}

const MEDALS = ['🥇', '🥈', '🥉'];

// Logs arrive newest first. Each negative (undo) entry removes the latest earlier completion of the same task by the same person.
const cancelUndone = (logs: TaskLog[]) => {
  const pending = new Map<string, number>();
  const kept: TaskLog[] = [];
  for (const log of logs) {
    const key = `${log.taskId}|${log.completedBy}`;
    if (log.xpAwarded < 0) {
      pending.set(key, (pending.get(key) || 0) + 1);
    } else if (pending.get(key)) {
      pending.set(key, pending.get(key)! - 1);
    } else {
      kept.push(log);
    }
  }
  return kept;
};

export default function FamilyView({ circle, members, logs, currentUserId }: FamilyViewProps) {
  const [range, setRange] = useState<'week' | 'month'>('week');
  const [copied, setCopied] = useState(false);
  const now = new Date();
  const today = dayKey(now);

  // An undo writes a negative log entry; hide it along with the completion it cancels
  const wins = cancelUndone(logs);
  const since = range === 'week' ? startOfWeek(now) : new Date(now.getFullYear(), now.getMonth(), 1);
  const inRange = wins.filter(l => new Date(l.completedAt) >= since);
  const todayLogs = wins.filter(l => dayKey(new Date(l.completedAt)) === today);

  const board = members
    .map(m => {
      const mine = inRange.filter(l => l.completedBy === m.uid);
      return { member: m, points: mine.reduce((s, l) => s + (l.xpAwarded || 0), 0), count: mine.length };
    })
    .sort((a, b) => b.points - a.points || b.count - a.count);
  const maxPoints = Math.max(1, ...board.map(b => b.points));

  // Feed grouped by day
  const groups: { key: string; items: TaskLog[] }[] = [];
  for (const log of wins.slice(0, 40)) {
    const key = dayKey(new Date(log.completedAt));
    const group = groups.find(g => g.key === key);
    if (group) group.items.push(log);
    else groups.push({ key, items: [log] });
  }

  const share = async () => {
    if (!circle) return;
    const text = `Join "${circle.name}" on SolRise and let's rise together! Use invite code ${circle.code}`;
    soundEffects.playTap();
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Join me on SolRise', text, url: window.location.origin });
        return;
      }
    } catch {
      // share cancelled; fall back to copying
    }
    try {
      await navigator.clipboard.writeText(circle.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl font-semibold text-ink">{circle?.name || 'Family'}</h1>
        <p className="text-sm text-muted mt-0.5">Rise together. Cheer each other on.</p>
      </header>

      {/* Today together */}
      <section className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink">Today together</h2>
          <span className="text-sm font-bold text-primary">{todayLogs.length} wins</span>
        </div>
        <div className="flex gap-4 mt-4 overflow-x-auto no-scrollbar pb-1">
          {members.map(m => {
            const count = todayLogs.filter(l => l.completedBy === m.uid).length;
            return (
              <div key={m.uid} className="flex flex-col items-center gap-1.5 shrink-0 w-16">
                <div className={`relative p-[3px] rounded-full ${count > 0 ? 'bg-gradient-to-br from-accent to-primary' : 'bg-line'}`}>
                  <div className="p-[2px] rounded-full bg-surface">
                    <Avatar user={m} size={48} />
                  </div>
                  {count > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -bottom-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-primary text-on-primary text-[11px] font-bold flex items-center justify-center ring-2 ring-surface"
                    >
                      {count}
                    </motion.span>
                  )}
                </div>
                <span className="text-xs font-semibold text-ink truncate w-full text-center">
                  {m.uid === currentUserId ? 'You' : m.displayName.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {members.length <= 1 && circle && (
        <section className="rounded-[24px] p-5 bg-primary-soft border border-primary/20">
          <div className="text-3xl">💌</div>
          <h2 className="font-semibold text-ink mt-2">Better together</h2>
          <p className="text-sm text-muted mt-1">
            Invite family or friends to share routines, split chores, and celebrate each other's wins.
          </p>
          <button onClick={share} className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-on-primary text-sm font-bold press cursor-pointer">
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Code copied!' : `Invite · ${circle.code}`}
          </button>
        </section>
      )}

      {/* Leaderboard */}
      {members.length > 1 && (
        <section className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-ink">Who's shining</h2>
            <div className="flex bg-subtle rounded-full p-1">
              {(['week', 'month'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  aria-pressed={range === r}
                  className={`relative px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${range === r ? 'text-ink' : 'text-muted'}`}
                >
                  {range === r && <motion.span layoutId="range-pill" className="absolute inset-0 bg-surface rounded-full shadow-sm" />}
                  <span className="relative">This {r}</span>
                </button>
              ))}
            </div>
          </div>
          <ol className="mt-4 space-y-3">
            {board.map((b, i) => {
              const me = b.member.uid === currentUserId;
              return (
                <li key={b.member.uid} className={`flex items-center gap-3 p-2 -mx-2 rounded-2xl ${me ? 'bg-primary-soft/60' : ''}`}>
                  <span className="w-7 text-center text-lg">{b.points > 0 && i < 3 ? MEDALS[i] : <span className="text-sm font-bold text-faint">{i + 1}</span>}</span>
                  <Avatar user={b.member} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink truncate">{me ? 'You' : b.member.displayName}</span>
                      {(b.member.dayStreak || 0) > 1 && (
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-primary">
                          <Flame className="w-3 h-3 fill-current" />
                          {b.member.dayStreak}
                        </span>
                      )}
                    </div>
                    <div className="h-1.5 bg-subtle rounded-full mt-1.5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${(b.points / maxPoints) * 100}%` }}
                        transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 70, damping: 16 }}
                      />
                    </div>
                    <div className="text-[11px] text-muted mt-1">
                      Lv {b.member.level} {levelTitle(b.member.level)} · {b.count} {b.count === 1 ? 'win' : 'wins'}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-ink tabular-nums">{b.points} XP</span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* Activity feed */}
      <section className="card p-5">
        <h2 className="font-semibold text-ink">Recent wins</h2>
        {groups.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl">🌤️</div>
            <p className="text-sm text-muted mt-2">Wins will show up here as they happen.</p>
          </div>
        ) : (
          <div className="mt-3 space-y-5">
            {groups.map(g => (
              <div key={g.key}>
                <div className="text-xs font-bold uppercase tracking-wider text-faint mb-2">{friendlyDate(g.key, now)}</div>
                <ul className="space-y-3">
                  {g.items.map(log => {
                    const member = members.find(m => m.uid === log.completedBy);
                    const me = log.completedBy === currentUserId;
                    return (
                      <li key={log.id} className="flex items-start gap-3">
                        {member ? (
                          <Avatar user={member} size={36} />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-subtle flex items-center justify-center text-lg shrink-0">{log.completedByEmoji}</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-ink leading-snug">
                            <span className="font-semibold">{me ? 'You' : log.completedByName}</span>
                            <span className="text-muted"> finished </span>
                            <span className="font-semibold">{log.taskTitle}</span>
                          </p>
                          <p className="text-xs text-muted mt-0.5">
                            {CATEGORY_META[log.taskCategory]?.emoji} {relativeTime(log.completedAt, now)} · <span className="text-accent font-semibold">+{log.xpAwarded} XP</span>
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
