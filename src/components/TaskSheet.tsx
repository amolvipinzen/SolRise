import { FormEvent, ReactNode, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Minus, Plus, Trash2 } from 'lucide-react';
import { Task, TaskCategory, TaskDifficulty, TaskDraft, TaskFrequency, UserProfile } from '../types';
import { CATEGORY_META, calculateXp, DayPartKey, PART_TIME, partOf, suggestEmoji, taskIcon, taskTitle } from '../lib/tasks';
import { dayKey } from '../lib/dates';
import Sheet from './ui/Sheet';
import Avatar from './ui/Avatar';
import PartIcon from './ui/PartIcon';

interface TaskSheetProps {
  members: UserProfile[];
  currentUserId: string;
  taskToEdit?: Task;
  initialFrequency?: TaskFrequency;
  initialTitle?: string;
  onClose: () => void;
  onSave: (draft: TaskDraft) => void;
  onDelete?: (task: Task) => void;
}

const EMOJI_CHOICES = ['✨', '💧', '🏃', '🧘', '📖', '📚', '🧹', '🍽️', '🧺', '🍳', '🛒', '🪴', '💊', '🐾', '💼', '📞', '💳', '🎵', '🚗', '😴', '🙏', '🎯', '💪', '❤️'];

const REPEAT_OPTIONS: { value: TaskFrequency; label: string }[] = [
  { value: 'Daily', label: 'Every day' },
  { value: 'Weekly', label: 'Every week' },
  { value: 'Monthly', label: 'Every month' },
  { value: 'One-time', label: 'Just once' },
];

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`px-3.5 py-2 rounded-full text-sm font-semibold border transition press cursor-pointer whitespace-nowrap ${
      active ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-ink border-line hover:border-primary/50'
    }`}
  >
    {children}
  </button>
);

const Label = ({ children }: { children: ReactNode }) => (
  <div className="text-xs font-bold uppercase tracking-wider text-muted mb-2">{children}</div>
);

export default function TaskSheet({
  members,
  currentUserId,
  taskToEdit,
  initialFrequency = 'Daily',
  initialTitle = '',
  onClose,
  onSave,
  onDelete,
}: TaskSheetProps) {
  const [title, setTitle] = useState(taskToEdit ? taskTitle(taskToEdit) : initialTitle);
  const [emoji, setEmoji] = useState<string | null>(taskToEdit ? taskIcon(taskToEdit) : suggestEmoji(initialTitle));
  const [emojiTouched, setEmojiTouched] = useState(!!taskToEdit);
  const [showEmojis, setShowEmojis] = useState(false);
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [category, setCategory] = useState<TaskCategory>(taskToEdit?.category || 'Routine');
  const [frequency, setFrequency] = useState<TaskFrequency>(taskToEdit?.frequency || initialFrequency);
  const [difficulty, setDifficulty] = useState<TaskDifficulty>(taskToEdit?.difficulty || 'Easy');
  const [assignedTo, setAssignedTo] = useState<string[]>(taskToEdit?.assignedTo?.length ? taskToEdit.assignedTo : [currentUserId]);
  const [part, setPart] = useState<DayPartKey>(taskToEdit ? partOf(taskToEdit) : 'Anytime');
  const [deadlineDate, setDeadlineDate] = useState(taskToEdit?.deadlineDate || '');
  const [repeatEvery, setRepeatEvery] = useState(taskToEdit?.recurrenceInterval || 1);
  const [durationType, setDurationType] = useState<'indefinite' | 'occurrences' | 'date'>(taskToEdit?.recurrenceDurationType || 'indefinite');
  const [durationValue, setDurationValue] = useState(taskToEdit?.recurrenceDurationValue || 10);
  const [endDate, setEndDate] = useState(taskToEdit?.recurrenceEndDate || '');
  const [showMore, setShowMore] = useState(!!(taskToEdit?.description || (taskToEdit?.recurrenceInterval || 1) > 1 || (taskToEdit?.recurrenceDurationType && taskToEdit.recurrenceDurationType !== 'indefinite')));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const xp = calculateXp(difficulty, frequency);
  const shownEmoji = emoji || CATEGORY_META[category].emoji;
  const isRecurring = frequency !== 'One-time';
  const unit = frequency === 'Daily' ? 'day' : frequency === 'Weekly' ? 'week' : 'month';

  const handleTitle = (value: string) => {
    setTitle(value);
    if (!emojiTouched) setEmoji(suggestEmoji(value));
  };

  const toggleAssignee = (uid: string) =>
    setAssignedTo(prev => (prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      emoji: shownEmoji,
      description: description.trim(),
      category,
      frequency,
      difficulty,
      xpReward: xp,
      assignedTo: assignedTo.length > 0 ? assignedTo : [currentUserId],
      timeOfDay: PART_TIME[part],
      deadlineDate: frequency === 'Daily' ? null : deadlineDate || null,
      isRecurring,
      recurrenceInterval: isRecurring ? repeatEvery : null,
      recurrenceDurationType: isRecurring ? durationType : null,
      recurrenceDurationValue: isRecurring && durationType === 'occurrences' ? durationValue : null,
      recurrenceEndDate: isRecurring && durationType === 'date' ? endDate || null : null,
    });
  };

  return (
    <Sheet
      title={taskToEdit ? 'Edit task' : 'What would make today better?'}
      subtitle={taskToEdit ? undefined : 'Keep it small and specific. You can always add more.'}
      onClose={onClose}
      footer={
        <div className="flex items-center gap-2">
          {taskToEdit && onDelete && (
            <button
              type="button"
              onClick={() => (confirmDelete ? onDelete(taskToEdit) : setConfirmDelete(true))}
              className={`h-12 rounded-2xl font-semibold text-sm flex items-center justify-center gap-1.5 transition press cursor-pointer ${
                confirmDelete ? 'px-4 bg-danger text-white' : 'w-12 bg-danger-soft text-danger'
              }`}
              aria-label="Delete task"
            >
              <Trash2 className="w-4.5 h-4.5" />
              {confirmDelete && 'Delete?'}
            </button>
          )}
          <button
            type="submit"
            form="task-form"
            disabled={!title.trim()}
            className="flex-1 h-12 rounded-2xl bg-primary text-on-primary font-bold text-base glow-primary press cursor-pointer disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {taskToEdit ? 'Save changes' : <>Plant it <span aria-hidden>🌱</span></>}
            <span className="text-xs font-bold bg-white/20 rounded-full px-2 py-0.5">+{xp} XP</span>
          </button>
        </div>
      }
    >
      <form id="task-form" onSubmit={submit} className="space-y-6 pt-1">
        {/* Title with emoji */}
        <div>
          <div className="flex items-center gap-2.5 bg-subtle rounded-2xl p-2 pr-3 focus-within:ring-2 focus-within:ring-primary/40">
            <button
              type="button"
              onClick={() => setShowEmojis(s => !s)}
              className="w-12 h-12 rounded-xl bg-surface text-2xl flex items-center justify-center shrink-0 press cursor-pointer"
              aria-label="Choose icon"
            >
              <motion.span key={shownEmoji} initial={{ scale: 0.4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}>
                {shownEmoji}
              </motion.span>
            </button>
            <input
              autoFocus={!taskToEdit}
              value={title}
              onChange={e => handleTitle(e.target.value)}
              placeholder="e.g. Drink 8 glasses of water"
              maxLength={80}
              className="flex-1 min-w-0 bg-transparent text-lg font-semibold text-ink placeholder:text-faint focus:outline-none"
              aria-label="Task title"
            />
          </div>
          <AnimatePresence>
            {showEmojis && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-8 gap-1 pt-2">
                  {EMOJI_CHOICES.map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => {
                        setEmoji(e);
                        setEmojiTouched(true);
                        setShowEmojis(false);
                      }}
                      className={`aspect-square rounded-xl text-xl flex items-center justify-center press cursor-pointer ${
                        shownEmoji === e ? 'bg-primary-soft' : 'hover:bg-subtle'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <Label>Kind</Label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(CATEGORY_META) as TaskCategory[]).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`rounded-2xl py-2.5 flex flex-col items-center gap-1 border transition press cursor-pointer ${
                  category === c ? 'bg-primary-soft border-primary text-ink' : 'bg-surface border-line text-muted hover:border-primary/40'
                }`}
              >
                <span className="text-xl">{CATEGORY_META[c].emoji}</span>
                <span className="text-xs font-bold">{CATEGORY_META[c].label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Repeat</Label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            {REPEAT_OPTIONS.map(o => (
              <Chip key={o.value} active={frequency === o.value} onClick={() => setFrequency(o.value)}>
                {o.label}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <Label>When</Label>
          <div className="grid grid-cols-4 gap-2">
            {(['Morning', 'Afternoon', 'Evening', 'Anytime'] as DayPartKey[]).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPart(p)}
                aria-pressed={part === p}
                className={`rounded-2xl py-2.5 flex flex-col items-center gap-1 border transition press cursor-pointer ${
                  part === p ? 'bg-primary-soft border-primary text-ink' : 'bg-surface border-line text-muted hover:border-primary/40'
                }`}
              >
                <PartIcon part={p} className="w-5 h-5" />
                <span className="text-xs font-bold">{p}</span>
              </button>
            ))}
          </div>
          {frequency !== 'Daily' && (
            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm text-muted font-medium">{frequency === 'One-time' ? 'Due' : 'Due by'}</span>
              <input
                type="date"
                value={deadlineDate}
                min={taskToEdit ? undefined : dayKey()}
                onChange={e => setDeadlineDate(e.target.value)}
                className="flex-1 bg-subtle rounded-xl px-3 py-2 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {deadlineDate && (
                <button type="button" onClick={() => setDeadlineDate('')} className="text-xs font-semibold text-muted hover:text-ink cursor-pointer">
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        <div>
          <Label>Effort</Label>
          <div className="grid grid-cols-3 gap-2">
            {(['Easy', 'Medium', 'Hard'] as TaskDifficulty[]).map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                aria-pressed={difficulty === d}
                className={`rounded-2xl py-2.5 border transition press cursor-pointer ${
                  difficulty === d ? 'bg-primary-soft border-primary' : 'bg-surface border-line hover:border-primary/40'
                }`}
              >
                <div className="text-sm font-bold text-ink">{d === 'Easy' ? '🍃 Light' : d === 'Medium' ? '🌿 Steady' : '🌳 Big'}</div>
                <div className="text-[11px] font-semibold text-accent mt-0.5">+{calculateXp(d, frequency)} XP</div>
              </button>
            ))}
          </div>
        </div>

        {members.length > 1 && (
          <div>
            <Label>Who's on it</Label>
            <div className="flex flex-wrap gap-2">
              {members.map(m => {
                const active = assignedTo.includes(m.uid);
                return (
                  <button
                    key={m.uid}
                    type="button"
                    onClick={() => toggleAssignee(m.uid)}
                    aria-pressed={active}
                    className={`flex items-center gap-2 pl-1 pr-3.5 py-1 rounded-full border text-sm font-semibold transition press cursor-pointer ${
                      active ? 'bg-primary-soft border-primary text-ink' : 'bg-surface border-line text-muted'
                    }`}
                  >
                    <Avatar user={m} size={28} />
                    {m.uid === currentUserId ? 'Me' : m.displayName}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Advanced options */}
        <div>
          <button
            type="button"
            onClick={() => setShowMore(s => !s)}
            className="flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink cursor-pointer"
            aria-expanded={showMore}
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showMore ? 'rotate-180' : ''}`} />
            More options
          </button>
          <AnimatePresence initial={false}>
            {showMore && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-5 pt-4">
                  <div>
                    <Label>Notes</Label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Any details or a reason why this matters to you"
                      rows={2}
                      className="w-full bg-subtle rounded-2xl px-4 py-3 text-sm text-ink placeholder:text-faint resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  {isRecurring && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-ink">Repeat every</span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setRepeatEvery(i => Math.max(1, i - 1))} className="w-8 h-8 rounded-full bg-subtle flex items-center justify-center press cursor-pointer" aria-label="Fewer">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-20 text-center text-sm font-bold text-ink">
                            {repeatEvery} {unit}
                            {repeatEvery > 1 ? 's' : ''}
                          </span>
                          <button type="button" onClick={() => setRepeatEvery(i => Math.min(30, i + 1))} className="w-8 h-8 rounded-full bg-subtle flex items-center justify-center press cursor-pointer" aria-label="More">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <Label>Ends</Label>
                        <div className="flex gap-2 flex-wrap">
                          <Chip active={durationType === 'indefinite'} onClick={() => setDurationType('indefinite')}>Never</Chip>
                          <Chip active={durationType === 'occurrences'} onClick={() => setDurationType('occurrences')}>After…</Chip>
                          <Chip active={durationType === 'date'} onClick={() => setDurationType('date')}>On a date</Chip>
                        </div>
                        {durationType === 'occurrences' && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-muted">
                            After
                            <input
                              type="number"
                              min={1}
                              value={durationValue}
                              onChange={e => setDurationValue(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-20 bg-subtle rounded-xl px-3 py-2 text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                            times
                          </div>
                        )}
                        {durationType === 'date' && (
                          <input
                            type="date"
                            required
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="mt-3 w-full bg-subtle rounded-xl px-3 py-2 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                          />
                        )}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </Sheet>
  );
}
