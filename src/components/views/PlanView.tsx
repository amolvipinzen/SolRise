import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, Search } from 'lucide-react';
import { Task, TaskFrequency, UserProfile } from '../../types';
import { byTime, CATEGORY_META, isAssignedTo, isDoneNow, isRetired, taskTitle } from '../../lib/tasks';
import TaskCard from '../TaskCard';
import NotebookPage, { NotebookHeading } from '../ui/NotebookPage';

interface PlanViewProps {
  tasks: Task[];
  members: UserProfile[];
  currentUserId: string;
  onToggle: (task: Task) => void;
  onOpenTask: (task: Task) => void;
  onNewTask: (preset?: { frequency?: TaskFrequency }) => void;
}

const TABS: { key: TaskFrequency | 'All'; label: string; emoji: string; blurb: string }[] = [
  { key: 'Daily', label: 'Daily', emoji: '☀️', blurb: 'Fresh every morning' },
  { key: 'Weekly', label: 'Weekly', emoji: '🗓️', blurb: 'Resets every Monday' },
  { key: 'Monthly', label: 'Monthly', emoji: '🌙', blurb: 'Resets on the 1st' },
  { key: 'One-time', label: 'Once', emoji: '📌', blurb: 'To-dos and goals' },
  { key: 'All', label: 'All', emoji: '📋', blurb: 'Everything in one place' },
];

export default function PlanView({ tasks, members, currentUserId, onToggle, onOpenTask, onNewTask }: PlanViewProps) {
  const [tab, setTab] = useState<TaskFrequency | 'All'>('Daily');
  const [query, setQuery] = useState('');
  const [mineOnly, setMineOnly] = useState(false);
  const [page, setPage] = useState<'todo' | 'done'>('todo');

  const counts = Object.fromEntries(
    TABS.map(t => [t.key, tasks.filter(task => t.key === 'All' || task.frequency === t.key).length]),
  );

  const visible = tasks
    .filter(t => tab === 'All' || t.frequency === tab)
    .filter(t => !mineOnly || isAssignedTo(t, currentUserId))
    .filter(t => !query.trim() || taskTitle(t).toLowerCase().includes(query.trim().toLowerCase()))
    .sort(byTime);

  const open = visible.filter(t => !isDoneNow(t) && !isRetired(t));
  const done = visible.filter(t => isDoneNow(t));
  const retired = visible.filter(t => !isDoneNow(t) && isRetired(t));
  const total = open.length + done.length;
  const active = TABS.find(t => t.key === tab)!;

  // Mix of categories, to show what the plan is made of
  const mix = (Object.keys(CATEGORY_META) as (keyof typeof CATEGORY_META)[])
    .map(c => ({ c, n: visible.filter(t => t.category === c).length }))
    .filter(x => x.n > 0);

  const card = (t: Task) => (
    <TaskCard key={t.id} task={t} members={members} currentUserId={currentUserId} onToggle={onToggle} onOpen={onOpenTask} variant="line" />
  );

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Your plan</h1>
          <p className="text-sm text-muted mt-0.5">The rhythms that shape your days.</p>
        </div>
        <button
          onClick={() => onNewTask({ frequency: tab === 'All' ? 'Daily' : tab })}
          className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-primary text-on-primary text-sm font-bold glow-primary press cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New
        </button>
      </header>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0" role="tablist">
        {TABS.map(t => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`relative shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold cursor-pointer transition-colors ${
              tab === t.key ? 'text-on-primary' : 'text-muted bg-surface border border-line hover:text-ink'
            }`}
          >
            {tab === t.key && <motion.span layoutId="plan-tab" className="absolute inset-0 bg-primary rounded-2xl" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <span className="relative">{t.emoji}</span>
            <span className="relative">{t.label}</span>
            <span className={`relative text-xs ${tab === t.key ? 'opacity-80' : 'text-faint'}`}>{counts[t.key]}</span>
          </button>
        ))}
      </div>

      <div className="card p-4 flex items-center gap-4">
        <div className="text-3xl">{active.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink">{active.blurb}</div>
          <div className="text-sm text-muted">
            {total === 0
              ? 'Nothing here yet'
              : `${done.length} of ${total} done${tab === 'Daily' ? ' today' : tab === 'Weekly' ? ' this week' : tab === 'Monthly' ? ' this month' : ''}`}
          </div>
          {total > 0 && (
            <div className="h-2 bg-subtle rounded-full mt-2 overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={false}
                animate={{ width: `${(done.length / total) * 100}%` }}
                transition={{ type: 'spring', stiffness: 80, damping: 18 }}
              />
            </div>
          )}
        </div>
        {mix.length > 0 && (
          <div className="hidden sm:flex gap-1.5">
            {mix.map(m => (
              <span key={m.c} className="text-xs font-semibold text-muted bg-subtle rounded-full px-2 py-1" title={CATEGORY_META[m.c].label}>
                {CATEGORY_META[m.c].emoji} {m.n}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-surface border border-line rounded-2xl px-3.5 focus-within:ring-2 focus-within:ring-primary/40">
          <Search className="w-4 h-4 text-faint" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tasks"
            className="flex-1 min-w-0 bg-transparent py-2.5 text-sm text-ink placeholder:text-faint focus:outline-none"
            aria-label="Search tasks"
          />
        </div>
        {members.length > 1 && (
          <button
            onClick={() => setMineOnly(m => !m)}
            aria-pressed={mineOnly}
            className={`px-3.5 py-2.5 rounded-2xl text-sm font-semibold border transition cursor-pointer ${
              mineOnly ? 'bg-primary-soft border-primary text-ink' : 'bg-surface border-line text-muted'
            }`}
          >
            Only mine
          </button>
        )}
      </div>

      <NotebookPage
        title={page === 'done' ? 'Done for now ✓' : tab === 'All' ? 'Everything' : `${active.label} page`}
        subtitle={page === 'done' ? 'Ticked off this period. Nice work.' : active.blurb}
        tabs={[
          { key: 'todo', label: 'To do', count: open.length },
          { key: 'done', label: 'Done', count: done.length },
        ]}
        activeTab={page}
        onTabChange={key => setPage(key as 'todo' | 'done')}
      >
        {visible.length === 0 ? (
          <div className="py-6 page-text">
            <p className="font-script text-[28px] font-bold text-ink leading-tight">
              {query ? 'No matches 🔍' : 'A blank page'}
            </p>
            <p className="font-hand text-[17px] text-muted mt-1">
              {query ? 'Try a different word.' : 'Add something small you want to repeat.'}
            </p>
            {!query && (
              <button
                onClick={() => onNewTask({ frequency: tab === 'All' ? 'Daily' : tab })}
                className="mt-4 px-4 py-2 rounded-full bg-primary text-on-primary text-sm font-bold press cursor-pointer"
              >
                Add a task
              </button>
            )}
          </div>
        ) : page === 'todo' ? (
          <>
            {open.length === 0 ? (
              <p className="font-hand text-[18px] text-muted py-6 page-text">Everything here is done for now. 🌤️</p>
            ) : (
              <AnimatePresence initial={false}>{open.map(card)}</AnimatePresence>
            )}
            {retired.length > 0 && (
              <div className="opacity-70">
                <NotebookHeading count={retired.length}>Finished their run</NotebookHeading>
                {retired.map(card)}
              </div>
            )}
          </>
        ) : done.length === 0 ? (
          <p className="font-hand text-[18px] text-muted py-6 page-text">Nothing ticked off yet. Your first one lands here. ✏️</p>
        ) : (
          <AnimatePresence initial={false}>{done.map(card)}</AnimatePresence>
        )}
      </NotebookPage>
    </div>
  );
}
