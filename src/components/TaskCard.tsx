import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Flame, Repeat, CalendarDays } from 'lucide-react';
import { Task, UserProfile } from '../types';
import { isDoneNow, isOverdue, partOf, recurrenceLabel, taskIcon, taskTitle } from '../lib/tasks';
import { friendlyDate } from '../lib/dates';
import { useCelebrate } from './celebrate/CelebrationProvider';
import { haptic, soundEffects } from '../utils/audio';
import Avatar from './ui/Avatar';
import PartIcon from './ui/PartIcon';

interface TaskCardProps {
  task: Task;
  members: UserProfile[];
  currentUserId: string;
  onToggle: (task: Task) => void;
  onOpen: (task: Task) => void;
  // 'line' sits on a ruled notebook page; 'card' is a standalone rounded card
  variant?: 'card' | 'line';
  // Hide the part-of-day label where the list is already grouped by it
  showPart?: boolean;
}

// How long the check animation plays in place before the card moves to "done"
const SETTLE_MS = 650;

export default function TaskCard({ task, members, currentUserId, onToggle, onOpen, variant = 'card', showPart = true }: TaskCardProps) {
  const celebrate = useCelebrate();
  const checkRef = useRef<HTMLButtonElement>(null);
  const [settling, setSettling] = useState(false);

  const done = isDoneNow(task) || settling;
  const overdue = !done && isOverdue(task);
  const assignees = members.filter(m => task.assignedTo?.includes(m.uid));
  const showAssignees = assignees.length > 1 || (assignees.length === 1 && assignees[0].uid !== currentUserId);
  const recurrence = recurrenceLabel(task);
  const line = variant === 'line';
  const boxShape = line ? 'rounded-[5px]' : 'rounded-full';
  // The notebook square is drawn small but keeps a comfortable 36px tap target around it
  const boxInset = line ? 'inset-[8px]' : 'inset-0';
  const part = partOf(task);

  const handleCheck = () => {
    if (settling) return;
    if (done) {
      soundEffects.playUndo();
      haptic(8);
      onToggle(task);
      return;
    }
    const rect = checkRef.current?.getBoundingClientRect();
    if (rect) {
      const origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      celebrate.burst(origin, task.difficulty === 'Hard' ? 60 : 36);
      celebrate.floatText(origin, `+${task.xpReward} XP`);
    }
    soundEffects.playComplete();
    haptic([10, 40, 18]);
    setSettling(true);
    setTimeout(() => {
      onToggle(task);
      setSettling(false);
    }, SETTLE_MS);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      className={line
        ? 'group relative flex items-center gap-3 py-2.5 ruled-line page-row'
        : `group relative flex items-center gap-3 p-3 pr-3.5 rounded-[20px] border transition-colors ${
          done ? 'bg-surface/60 border-line/60' : 'bg-surface border-line hover:border-primary/40'
        } ${overdue ? 'border-danger/30' : ''}`}
    >
      {/* Animated checkbox */}
      <button
        ref={checkRef}
        onClick={handleCheck}
        aria-label={done ? `Mark "${taskTitle(task)}" as not done` : `Complete "${taskTitle(task)}"`}
        aria-pressed={done}
        className={`relative shrink-0 flex items-center justify-center cursor-pointer ${boxShape} ${line ? 'w-9 h-9 -ml-0.5 mr-2' : 'w-9 h-9'}`}
      >
        <motion.span
          className={`absolute ${boxInset} border-2 ${boxShape}`}
          initial={false}
          animate={{
            backgroundColor: done ? 'var(--t-success)' : 'rgba(0,0,0,0)',
            borderColor: done ? 'var(--t-success)' : overdue ? 'var(--t-danger)' : 'var(--t-faint)',
            scale: settling ? [1, 1.25, 1] : 1,
          }}
          transition={{ duration: 0.35 }}
        />
        {settling && (
          <motion.span
            className={`absolute ${boxInset} border-2 border-success ${boxShape}`}
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
        <svg viewBox="0 0 24 24" className={`relative ${line ? 'w-3.5 h-3.5' : 'w-5 h-5'}`} aria-hidden="true">
          <motion.path
            d="M5 12.5l4.2 4.2L19 7"
            fill="none"
            stroke="white"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: done ? 1 : 0, opacity: done ? 1 : 0 }}
            transition={{ duration: 0.3, delay: done ? 0.08 : 0 }}
          />
        </svg>
        {!done && (
          <span className={`absolute ${line ? 'inset-[5px]' : 'inset-1'} bg-success/0 group-hover:bg-success/15 transition-colors ${boxShape}`} />
        )}
      </button>

      {/* Body: tap to open details */}
      <button onClick={() => onOpen(task)} className="flex-1 min-w-0 flex items-center gap-3 text-left cursor-pointer">
        <motion.span
          className={`flex items-center justify-center shrink-0 ${line ? 'w-7 text-[22px]' : 'w-10 h-10 rounded-[14px] text-xl'} ${
            done ? `grayscale-[40%] ${line ? 'opacity-60' : 'bg-subtle/60'}` : line ? '' : 'bg-subtle'
          }`}
          animate={settling ? { rotate: [0, -12, 12, 0], scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          {taskIcon(task)}
        </motion.span>
        <span className="flex-1 min-w-0">
          <span className="relative inline-block max-w-full align-top">
            <span
              className={`block truncate transition-colors duration-500 ${
                line ? 'font-hand text-[19px] leading-tight' : 'font-semibold text-[15px] leading-snug'
              } ${done ? 'text-faint' : 'text-ink'}`}
            >
              {taskTitle(task)}
            </span>
            {line ? (
              /* A pen stroke that scribbles across, like crossing it off by hand */
              <svg viewBox="0 0 100 12" preserveAspectRatio="none" className="absolute -left-1 -right-1 top-1/2 -translate-y-1/2 h-3 w-[calc(100%+8px)] overflow-visible pointer-events-none" aria-hidden="true">
                <motion.path
                  d="M1 7 C 18 3, 30 9, 48 6 S 80 3, 99 6"
                  fill="none"
                  stroke="var(--t-primary)"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  initial={false}
                  animate={{ pathLength: done ? 1 : 0, opacity: done ? 0.85 : 0 }}
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                />
              </svg>
            ) : (
              /* Strike-through that draws across */
              <motion.span
                className="absolute left-0 top-1/2 h-[2px] bg-faint rounded-full"
                initial={false}
                animate={{ width: done ? '100%' : '0%' }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              />
            )}
          </span>
          <span className="flex items-center flex-wrap gap-x-2.5 gap-y-0.5 mt-0.5 text-xs text-muted">
            {showPart && part !== 'Anytime' && (
              <span className="inline-flex items-center gap-1">
                <PartIcon part={part} className="w-3 h-3" />
                {part}
              </span>
            )}
            {task.deadlineDate && (
              <span className={`inline-flex items-center gap-1 ${overdue ? 'text-danger font-semibold' : ''}`}>
                <CalendarDays className="w-3 h-3" />
                {friendlyDate(task.deadlineDate)}
              </span>
            )}
            {recurrence && (
              <span className="inline-flex items-center gap-1">
                <Repeat className="w-3 h-3" />
                {recurrence}
              </span>
            )}
            {task.streak >= 2 && task.frequency !== 'One-time' && (
              <span className="inline-flex items-center gap-0.5 text-primary font-semibold">
                <Flame className="w-3 h-3 fill-current" />
                {task.streak}
              </span>
            )}
            <span className="font-semibold text-accent">+{task.xpReward}</span>
          </span>
        </span>
      </button>

      {showAssignees && (
        <div className="flex -space-x-2 shrink-0">
          {assignees.slice(0, 3).map(m => (
            <Avatar key={m.uid} user={m} size={26} ring />
          ))}
          {assignees.length > 3 && (
            <span className="w-[26px] h-[26px] rounded-full bg-subtle ring-2 ring-surface text-[10px] font-bold text-muted flex items-center justify-center">
              +{assignees.length - 3}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
