import { FormEvent, ReactNode, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { DailyCheckin, Task, TaskFrequency, UserProfile } from '../../types';
import { byTime, DAY_PARTS, isAssignedTo, isDoneNow, isForToday, isOverdue, isRetired, partOf, suggestEmoji } from '../../lib/tasks';
import TaskCard from '../TaskCard';
import NotebookPage, { NotebookHeading } from '../ui/NotebookPage';
import PartIcon from '../ui/PartIcon';
import { dayKey } from '../../lib/dates';
import SkyHeader from './SkyHeader';
import DailyNoteHeader from './DailyNoteHeader';
import CheckinCard from './CheckinCard';
import WeekRhythm from './WeekRhythm';

interface TodayViewProps {
  profile: UserProfile;
  tasks: Task[];
  members: UserProfile[];
  onToggle: (task: Task) => void;
  onOpenTask: (task: Task) => void;
  onNewTask: (preset?: { title?: string; frequency?: TaskFrequency }) => void;
  onQuickAdd: (title: string, emoji: string | null) => void;
  onCheckin: (patch: Partial<DailyCheckin>) => void;
}

const STARTERS = [
  { emoji: '💧', title: 'Drink 8 glasses of water' },
  { emoji: '🚶', title: 'Take a 10-minute walk' },
  { emoji: '📖', title: 'Read 10 pages' },
  { emoji: '🧘', title: 'Breathe for 5 minutes' },
  { emoji: '🗓️', title: 'Plan tomorrow' },
  { emoji: '🧹', title: 'Tidy up for 10 minutes' },
];

// A handwritten heading on the page, optionally folding its entries away
const Section = ({ title, count, children, collapsible = false, defaultOpen = true, tone }: {
  title: ReactNode;
  count?: number;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  tone?: 'ink' | 'danger';
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <NotebookHeading count={count} tone={tone} open={open} onToggle={collapsible ? () => setOpen(o => !o) : undefined}>
        {title}
      </NotebookHeading>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function TodayView({ profile, tasks, members, onToggle, onOpenTask, onNewTask, onQuickAdd, onCheckin }: TodayViewProps) {
  const [scope, setScope] = useState<'mine' | 'all'>('mine');
  const [quick, setQuick] = useState('');
  const [page, setPage] = useState<'todo' | 'done'>('todo');
  const now = new Date();

  const scoped = useMemo(
    () => tasks.filter(t => scope === 'all' || isAssignedTo(t, profile.uid)),
    [tasks, scope, profile.uid],
  );

  const todays = scoped.filter(t => isForToday(t, now)).sort(byTime);
  const todo = todays.filter(t => !isDoneNow(t, now));
  const doneToday = todays.filter(t => isDoneNow(t, now));
  const periodic = scoped
    .filter(t => (t.frequency === 'Weekly' || t.frequency === 'Monthly') && !isRetired(t, now))
    .sort(byTime);
  const periodicTodo = periodic.filter(t => !isDoneNow(t, now));
  const periodicDone = periodic.filter(t => isDoneNow(t, now));
  const upcoming = scoped
    .filter(t => t.frequency === 'One-time' && t.status !== 'Completed' && !!t.deadlineDate && !isForToday(t, now))
    .sort((a, b) => (a.deadlineDate! < b.deadlineDate! ? -1 : 1));

  // Missed deadlines first, then grouped by part of day
  const overdue = todo.filter(t => isOverdue(t, now));
  const groups = DAY_PARTS
    .map(part => ({ part, items: todo.filter(t => !overdue.includes(t) && partOf(t) === part) }))
    .filter(g => g.items.length > 0);

  const submitQuick = (e: FormEvent) => {
    e.preventDefault();
    if (!quick.trim()) return;
    onQuickAdd(quick.trim(), suggestEmoji(quick));
    setQuick('');
  };

  const entry = (t: Task) => (
    <TaskCard key={t.id} task={t} members={members} currentUserId={profile.uid} onToggle={onToggle} onOpen={onOpenTask} variant="line" showPart={false} />
  );

  const nothingAtAll = tasks.length === 0;
  const allClear = todays.length > 0 && todo.length === 0;
  const doneAll = [...doneToday, ...periodicDone];
  const xpToday = doneToday.reduce((sum, t) => sum + (t.xpReward || 0), 0);
  const todoCount = todo.length + periodicTodo.length;

  // Both pages are on screen mid-turn, so this toggle avoids shared layout animations
  const scopeToggle = members.length > 1 && (
    <div className="flex bg-subtle rounded-full p-0.5 shrink-0" role="group" aria-label="Whose tasks">
      {(['mine', 'all'] as const).map(s => (
        <button
          key={s}
          aria-pressed={scope === s}
          onClick={() => setScope(s)}
          className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${scope === s ? 'bg-surface text-ink shadow-sm' : 'text-muted'}`}
        >
          {s === 'mine' ? 'Mine' : 'Family'}
        </button>
      ))}
    </div>
  );

  const quickAddLine = (
    <form onSubmit={submitQuick} className="flex items-center gap-3 py-2.5 ruled-line page-row focus-within:bg-primary-soft/30 transition-colors">
      <span className="w-9 h-9 -ml-0.5 mr-2 flex items-center justify-center shrink-0">
        <span className="w-5 h-5 rounded-[5px] border-2 border-dashed border-faint/70 flex items-center justify-center">
          <Plus className="w-3 h-3 text-faint" strokeWidth={3} />
        </span>
      </span>
      <input
        value={quick}
        onChange={e => setQuick(e.target.value)}
        placeholder="write something for today…"
        maxLength={80}
        className="flex-1 min-w-0 bg-transparent font-hand text-[19px] text-ink placeholder:text-faint focus:outline-none"
        aria-label="Quick add a task for today"
      />
      <AnimatePresence>
        {quick.trim() && (
          <motion.button
            type="submit"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            className="px-3 py-1 rounded-full bg-primary text-on-primary text-sm font-bold press cursor-pointer"
          >
            Add
          </motion.button>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => onNewTask({ title: quick.trim() || undefined })}
        className="p-1.5 rounded-lg text-faint hover:bg-subtle hover:text-ink transition cursor-pointer"
        aria-label="Plan with more options"
        title="Plan with more options"
      >
        <SlidersHorizontal className="w-4 h-4" />
      </button>
    </form>
  );

  const todoPage = nothingAtAll ? (
    <>
      <div className="py-6 page-text">
        <p className="font-script text-[28px] font-bold text-ink leading-tight">Let's plant your first habit 🌱</p>
        <p className="font-hand text-[17px] text-muted mt-1">Start tiny. Pick one and we'll cheer you on.</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {STARTERS.map(s => (
            <button
              key={s.title}
              onClick={() => onNewTask({ title: s.title, frequency: 'Daily' })}
              className="px-3 py-1.5 rounded-full border border-line bg-surface font-hand text-[16px] text-ink hover:border-primary hover:bg-primary-soft transition press cursor-pointer"
            >
              {s.emoji} {s.title}
            </button>
          ))}
        </div>
      </div>
      {quickAddLine}
    </>
  ) : (
    <>
      {allClear && (
        <div className="page-text pt-5">
          <motion.div
            initial={{ opacity: 0, rotate: -2, scale: 0.9 }}
            animate={{ opacity: 1, rotate: -2, scale: 1 }}
            className="inline-flex items-center gap-3 rounded-2xl bg-success-soft border border-success/25 px-4 py-3"
          >
            <motion.span className="text-3xl" animate={{ rotate: [0, 12, -12, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
              ☀️
            </motion.span>
            <span>
              <span className="block font-script text-[24px] font-bold text-ink leading-none">All clear for today!</span>
              <button
                onClick={() => setPage('done')}
                className="font-hand text-[16px] text-primary underline decoration-dashed underline-offset-4 cursor-pointer"
              >
                Turn the page to see what you did →
              </button>
            </span>
          </motion.div>
        </div>
      )}

      {todays.length === 0 && (
        <p className="font-hand text-[17px] text-muted pt-5 page-text">Nothing scheduled today. Enjoy the space, or jot one small win below.</p>
      )}

      {overdue.length > 0 && (
        <Section title="Needs a little love" count={overdue.length} tone="danger">
          <AnimatePresence initial={false}>{overdue.map(entry)}</AnimatePresence>
        </Section>
      )}

      {groups.map(g => (
        <Section
          key={g.part}
          title={<span className="inline-flex items-center gap-2">{g.part}<PartIcon part={g.part} className="w-[18px] h-[18px]" /></span>}
          count={g.items.length}
        >
          <AnimatePresence initial={false}>{g.items.map(entry)}</AnimatePresence>
        </Section>
      ))}

      {quickAddLine}

      {periodicTodo.length > 0 && (
        <Section title="This week & month" count={periodicTodo.length} collapsible>
          <AnimatePresence initial={false}>{periodicTodo.map(entry)}</AnimatePresence>
        </Section>
      )}

      {upcoming.length > 0 && (
        <Section title="Coming up ⏳" count={upcoming.length} collapsible defaultOpen={false}>
          {upcoming.slice(0, 8).map(entry)}
        </Section>
      )}
    </>
  );

  const doneHeader = (
    <header className="relative page-text pb-4 ruled-line">
      <span className="washi washi-accent -top-[30px] left-[30%] w-24 rotate-[-3deg]" aria-hidden="true" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-script text-[40px] leading-none font-bold text-success">Crossed off ✓</h2>
          <p className="font-hand text-[17px] text-muted mt-1">
            {doneToday.length === 0
              ? 'Your first tick of the day is waiting.'
              : doneToday.length === 1
                ? 'One thing done. That is how every great day starts.'
                : `${doneToday.length} wins today. Look at you go.`}
          </p>
        </div>
        {scopeToggle}
      </div>
      {doneToday.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 font-hand text-[16px]">
          <span className="px-3 py-1 rounded-full bg-accent-soft text-ink">⭐ +{xpToday} XP today</span>
          {(profile.dayStreak || 0) > 0 && (
            <span className="px-3 py-1 rounded-full bg-primary-soft text-ink">🔥 {profile.dayStreak}-day streak</span>
          )}
        </div>
      )}
    </header>
  );

  const donePage = doneAll.length === 0 ? (
    <div className="page-text py-8 text-center">
      <div className="text-4xl">✏️</div>
      <p className="font-hand text-[18px] text-muted mt-2">Tick something on the other page and it lands here.</p>
      <button
        onClick={() => setPage('todo')}
        className="mt-3 font-hand text-[17px] text-primary underline decoration-dashed underline-offset-4 cursor-pointer"
      >
        ← Back to the to-do page
      </button>
    </div>
  ) : (
    <>
      {doneToday.length > 0 && (
        <Section title="Today" count={doneToday.length}>
          <AnimatePresence initial={false}>{doneToday.map(entry)}</AnimatePresence>
        </Section>
      )}
      {periodicDone.length > 0 && (
        <Section title="This week & month" count={periodicDone.length}>
          <AnimatePresence initial={false}>{periodicDone.map(entry)}</AnimatePresence>
        </Section>
      )}
    </>
  );

  const todaysIntention = profile.checkin?.date === dayKey(now) ? profile.checkin.intention : undefined;

  return (
    <div className="space-y-5">
      <SkyHeader
        name={profile.displayName}
        done={doneToday.length}
        total={todays.length}
        dayStreak={profile.dayStreak || 0}
        level={profile.level}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <CheckinCard checkin={profile.checkin} onSave={onCheckin} />
        <WeekRhythm activeDays={profile.activeDays || []} dayStreak={profile.dayStreak || 0} bestStreak={profile.bestStreak || 0} />
      </div>

      <NotebookPage
        tabs={[
          { key: 'todo', label: 'To do', count: todoCount },
          { key: 'done', label: 'Done', count: doneAll.length },
        ]}
        activeTab={page}
        onTabChange={key => setPage(key as 'todo' | 'done')}
        header={page === 'todo' ? <DailyNoteHeader intention={todaysIntention} aside={scopeToggle} /> : doneHeader}
      >
        {page === 'todo' ? todoPage : donePage}
      </NotebookPage>
    </div>
  );
}
