import { useState } from 'react';
import { Task, UserProfile, TaskCategory, TaskFrequency } from '../types';
import {
  Trash2,
  Clock,
  Calendar,
  Star,
  Sparkles,
  CheckCircle,
  Plus,
  Pencil,
  Heart,
  Check,
  LayoutGrid,
  Circle
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

// Deluxe iOS-style single botanical lavender sprig component with clean, defined shapes
export const LavenderSprig = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg viewBox="0 0 100 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Stem: Slender muted sage green (#7FA36A) */}
    <path d="M50 132 C50 98 50 64 50 25" stroke="#7FA36A" strokeWidth="2.2" strokeLinecap="round" />

    {/* Leaves: Linear-lanceolate pairs along the base */}
    {/* Pair 1 */}
    <path d="M49 115 C42 113 38 107 40 101 C42 98 45 101 49 109 Z" fill="#7FA36A" stroke="#567A46" strokeWidth="0.8" />
    <path d="M51 113 C58 111 62 105 60 99 C58 96 55 99 51 107 Z" fill="#7FA36A" stroke="#567A46" strokeWidth="0.8" />
    {/* Pair 2 */}
    <path d="M49 95 C43 93 40 88 42 82 C44 79 46 82 49 89 Z" fill="#7FA36A" stroke="#567A46" strokeWidth="0.8" />
    <path d="M51 94 C57 92 60 87 58 81 C56 78 54 81 51 88 Z" fill="#7FA36A" stroke="#567A46" strokeWidth="0.8" />
    {/* Pair 3 */}
    <path d="M49 76 C45 74 42 70 44 65 C45 62 47 65 49 71 Z" fill="#7FA36A" stroke="#567A46" strokeWidth="0.8" />
    <path d="M51 75 C55 73 58 69 56 64 C55 61 53 64 51 70 Z" fill="#7FA36A" stroke="#567A46" strokeWidth="0.8" />

    {/* Florets: 8 distinct, vertically stacked clusters (verticillasters) */}
    {/* Cluster 1 (y=84) */}
    <g transform="translate(50, 84)">
      <ellipse cx="-6" cy="0" rx="2.2" ry="3.5" transform="rotate(-45)" fill="#8B6FE8" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="6" cy="0" rx="2.2" ry="3.5" transform="rotate(45)" fill="#8B6FE8" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="-3.5" cy="-3" rx="1.8" ry="3" transform="rotate(-20)" fill="#9E86F0" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="3.5" cy="-3" rx="1.8" ry="3" transform="rotate(20)" fill="#9E86F0" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="0" cy="-5" rx="1.8" ry="3" fill="#B59BFF" stroke="#5C42A5" strokeWidth="0.8" />
    </g>

    {/* Cluster 2 (y=75) */}
    <g transform="translate(50, 75)">
      <ellipse cx="-5.5" cy="0" rx="2.2" ry="3.5" transform="rotate(-40)" fill="#8B6FE8" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="5.5" cy="0" rx="2.2" ry="3.5" transform="rotate(40)" fill="#8B6FE8" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="-3.2" cy="-3" rx="1.8" ry="3" transform="rotate(-20)" fill="#9E86F0" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="3.2" cy="-3" rx="1.8" ry="3" transform="rotate(20)" fill="#9E86F0" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="0" cy="-5" rx="1.8" ry="3" fill="#B59BFF" stroke="#5C42A5" strokeWidth="0.8" />
    </g>

    {/* Cluster 3 (y=66) */}
    <g transform="translate(50, 66)">
      <ellipse cx="-5" cy="0" rx="2" ry="3.2" transform="rotate(-35)" fill="#8B6FE8" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="5" cy="0" rx="2" ry="3.2" transform="rotate(35)" fill="#8B6FE8" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="-3" cy="-2.8" rx="1.8" ry="2.8" transform="rotate(-15)" fill="#9E86F0" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="3" cy="-2.8" rx="1.8" ry="2.8" transform="rotate(15)" fill="#9E86F0" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="0" cy="-4.5" rx="1.8" ry="3" fill="#B59BFF" stroke="#5C42A5" strokeWidth="0.8" />
    </g>

    {/* Cluster 4 (y=57) */}
    <g transform="translate(50, 57)">
      <ellipse cx="-4.5" cy="0" rx="2" ry="3.2" transform="rotate(-30)" fill="#8B6FE8" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="4.5" cy="0" rx="2" ry="3.2" transform="rotate(30)" fill="#8B6FE8" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="-2.8" cy="-2.5" rx="1.6" ry="2.6" transform="rotate(-15)" fill="#9E86F0" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="2.8" cy="-2.5" rx="1.6" ry="2.6" transform="rotate(15)" fill="#9E86F0" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="0" cy="-4" rx="1.6" ry="2.8" fill="#B59BFF" stroke="#5C42A5" strokeWidth="0.8" />
    </g>

    {/* Cluster 5 (y=48) */}
    <g transform="translate(50, 48)">
      <ellipse cx="-4" cy="0" rx="1.8" ry="3" transform="rotate(-30)" fill="#8B6FE8" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="4" cy="0" rx="1.8" ry="3" transform="rotate(30)" fill="#8B6FE8" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="0" cy="-3.5" rx="1.6" ry="2.6" fill="#B59BFF" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="0" cy="1" rx="1.2" ry="2" fill="#D8C9FF" stroke="#5C42A5" strokeWidth="0.8" />
    </g>

    {/* Cluster 6 (y=39) */}
    <g transform="translate(50, 39)">
      <ellipse cx="-3.5" cy="0" rx="1.8" ry="2.8" transform="rotate(-25)" fill="#8B6FE8" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="3.5" cy="0" rx="1.8" ry="2.8" transform="rotate(25)" fill="#8B6FE8" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="0" cy="-3" rx="1.4" ry="2.4" fill="#B59BFF" stroke="#5C42A5" strokeWidth="0.8" />
    </g>

    {/* Cluster 7 (y=30) */}
    <g transform="translate(50, 30)">
      <ellipse cx="-2.8" cy="0" rx="1.6" ry="2.4" transform="rotate(-20)" fill="#9E86F0" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="2.8" cy="0" rx="1.6" ry="2.4" transform="rotate(20)" fill="#9E86F0" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="0" cy="-2.5" rx="1.2" ry="2" fill="#B59BFF" stroke="#5C42A5" strokeWidth="0.8" />
    </g>

    {/* Cluster 8 (y=21) */}
    <g transform="translate(50, 21)">
      <ellipse cx="-2" cy="0" rx="1.2" ry="2" transform="rotate(-15)" fill="#B59BFF" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="2" cy="0" rx="1.2" ry="2" transform="rotate(15)" fill="#B59BFF" stroke="#5C42A5" strokeWidth="0.8" />
      <ellipse cx="0" cy="-2" rx="1" ry="1.6" fill="#D8C9FF" stroke="#5C42A5" strokeWidth="0.8" />
    </g>
  </svg>
);

// Potted lavender floral graphic matching the completed task icon
const LavenderPot = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Plant pot */}
    <path d="M25 65 L28 88 C28 91 30 93 33 93 L47 93 C50 93 52 91 52 88 L55 65 Z" fill="#B39DFA" opacity="0.9" />
    {/* Pot rim */}
    <rect x="22" y="59" width="36" height="6" rx="2" fill="#8A6CE2" />
    {/* Cute white heart on the pot */}
    <path d="M40 79 C40 79 37 76 35 78 C33 80 35 83 40 86 C45 83 47 80 45 78 C43 76 40 79 40 79 Z" fill="#FFFFFF" opacity="0.75" />
    {/* Lavender stems */}
    <path d="M40 60 C38 43 35 28 36 13" stroke="#718F5B" strokeWidth="2.2" />
    <path d="M36 60 C32 46 24 33 22 20" stroke="#718F5B" strokeWidth="1.8" />
    <path d="M44 60 C48 46 56 33 58 20" stroke="#718F5B" strokeWidth="1.8" />
    {/* Foliage leaves */}
    <path d="M35 55 C27 52 24 47 33 49" stroke="#718F5B" strokeWidth="1.5" fill="#718F5B" />
    <path d="M45 55 C53 52 56 47 47 49" stroke="#718F5B" strokeWidth="1.5" fill="#718F5B" />
    {/* Central buds */}
    <circle cx="34" cy="28" r="3.5" fill="#9D82F2" />
    <circle cx="38" cy="25" r="3.5" fill="#886AE6" />
    <circle cx="36" cy="20" r="3.5" fill="#BFAEF8" />
    <circle cx="34" cy="14" r="2.5" fill="#886AE6" />
    <circle cx="38" cy="12" r="2.5" fill="#9D82F2" />
    <circle cx="36" cy="8" r="2" fill="#D3C7FC" />
    {/* Left buds */}
    <circle cx="21" cy="32" r="3" fill="#886AE6" />
    <circle cx="25" cy="29" r="3" fill="#9D82F2" />
    <circle cx="22" cy="24" r="3" fill="#BFAEF8" />
    <circle cx="20" cy="18" r="2.5" fill="#886AE6" />
    {/* Right buds */}
    <circle cx="59" cy="32" r="3" fill="#886AE6" />
    <circle cx="55" cy="29" r="3" fill="#9D82F2" />
    <circle cx="57" cy="24" r="3" fill="#BFAEF8" />
    <circle cx="59" cy="18" r="2.5" fill="#886AE6" />
  </svg>
);

interface TaskListProps {
  tasks: Task[];
  members: UserProfile[];
  currentUserId: string;
  onToggleComplete: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateTaskClick?: () => void;
  onEditTaskClick?: (task: Task) => void;
}

export default function TaskList({
  tasks,
  members,
  currentUserId,
  onToggleComplete,
  onDeleteTask,
  onCreateTaskClick,
  onEditTaskClick
}: TaskListProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Pending'>('All');
  const [filterFrequency, setFilterFrequency] = useState<TaskFrequency | 'All'>('Daily');
  const [selectedMood, setSelectedMood] = useState<string | null>(() => {
    return localStorage.getItem('chore_book_mood') || null;
  });

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    localStorage.setItem('chore_book_mood', mood);
    try {
      soundEffects.playChime();
    } catch (e) {
      // safe fallback
    }
  };

  // Find assignees as profile objects for list visualization
  const getAssigneeProfiles = (assigneeIds: string[]) => {
    return members.filter(m => assigneeIds.includes(m.uid));
  };

  // Filter tasks based on selected filter options
  const filteredTasks = tasks.filter((task) => {
    const frequencyMatch = filterFrequency === 'All' || (task.frequency as string) === (filterFrequency as string);
    const statusMatch = statusFilter === 'All' || 
      (statusFilter === 'Completed' && task.status === 'Completed') ||
      (statusFilter === 'Pending' && task.status === 'Pending');
    return frequencyMatch && statusMatch;
  });

  // Calculate completion percentage
  const totalCount = filteredTasks.length;
  const completedCount = filteredTasks.filter(t => t.status === 'Completed').length;
  const completionPercent = totalCount > 0 ? Math.floor((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">

      {/* Chore Frequency Tabs */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {[
          {
            key: 'Daily',
            label: 'Daily',
            icon: (
              <div className="relative flex items-center justify-center">
                <span className="text-xl sm:text-2xl animate-pulse">☀️</span>
                <span className="absolute -top-1 -right-1 text-purple-400 text-[10px]">✦</span>
                <span className="absolute -bottom-1 -left-1 text-purple-300 text-[8px]">✦</span>
              </div>
            )
          },
          {
            key: 'Weekly',
            label: 'Weekly',
            icon: (
              <div className="relative flex items-center justify-center">
                <span className="text-xl sm:text-2xl">📅</span>
              </div>
            )
          },
          {
            key: 'Monthly',
            label: 'Monthly',
            icon: (
              <div className="relative flex items-center justify-center">
                <span className="text-xl sm:text-2xl">🌙</span>
              </div>
            )
          },
          {
            key: 'All',
            label: 'All Chores',
            icon: (
              <div className="relative flex items-center justify-center">
                <span className="text-xl sm:text-2xl">📋</span>
              </div>
            )
          },
        ].map((tab) => {
          const isActive = filterFrequency === tab.key;

          return (
            <button
              key={tab.key}
              id={`tab-freq-${tab.key.toLowerCase()}`}
              onClick={() => setFilterFrequency(tab.key as TaskFrequency | 'All')}
              className={`py-3 sm:py-5 px-1.5 sm:px-3 rounded-[20px] sm:rounded-[24px] text-xs font-bold tracking-wide text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 sm:gap-2.5 active:scale-95 ${isActive
                  ? 'bg-gradient-to-b from-[#FAF8FF] to-[#E5DCFC] border-2 border-[#B3A0F2] text-[#4E3494] shadow-[0_4px_12px_rgba(157,130,242,0.18)] font-black'
                  : 'bg-white border border-[#EBE5F7] text-[#7E7399] hover:bg-[#FAF8FF] hover:border-[#D5C7F7] shadow-xs font-medium'
                }`}
            >
              {tab.icon}
              <span className="font-sans text-[11px] sm:text-xs tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* One-Time full width banner button */}
      <button
        id="tab-freq-one-time"
        onClick={() => setFilterFrequency('One-time')}
        className={`w-full py-3 px-4 sm:px-6 rounded-full text-center transition-all cursor-pointer flex items-center justify-between active:scale-98 ${filterFrequency === 'One-time'
            ? 'bg-gradient-to-r from-[#FAF8FF] via-[#E5DCFC] to-[#FAF8FF] border-2 border-[#B3A0F2] text-[#4E3494] shadow-[0_4px_12px_rgba(157,130,242,0.15)]'
            : 'bg-white/80 border border-[#E9E4F5] text-[#7E7399] hover:bg-[#FAF8FF] hover:border-[#D5C7F7] shadow-xs'
          }`}
      >
        <div className="flex items-center gap-1.5 font-caveat font-bold text-lg sm:text-xl text-[#7E7399]">
          <span className="text-[#9D82F2] text-sm">★</span>
          <span className="italic text-[#5C42A5] font-black tracking-wide">One-Time</span>
        </div>

        {/* Dashed connector line */}
        <div className="flex-1 border-b border-dashed border-[#E1D8F5] mx-4 opacity-70"></div>

        <div className="flex items-center gap-1">
          <span className="text-purple-300 text-xs select-none">🌿</span>
        </div>
      </button>

      {/* Filter and Completion Rates bar aligned with the notebook page layout */}
      <div className="bg-white rounded-[24px] p-4 sm:p-5 border border-[#E9E4F5] shadow-xs space-y-3.5">

        {/* Top row containing Completion status and Lavender Pot in a single line */}
        <div className="flex items-center justify-between gap-3">

          {/* Completion status in the center / left of center */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#5C42A5] flex-1 justify-start">
            {/* Dashed circle check mark icon */}
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-dashed border-[#7A63D4] flex items-center justify-center bg-[#F3EEFA] shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3] text-[#7A63D4]" />
            </div>
            <span className="tracking-tight text-left">Completion: {completedCount}/{totalCount} Done ({completionPercent}%)</span>
          </div>

          {/* Lavender Pot sticker on the right */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#F0EBFC] border border-[#E2D9F3] flex items-center justify-center text-[#7A63D4] shadow-xs shrink-0">
            <LavenderPot className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>

        </div>

        {/* Completion Progress Bar */}
        <div className="flex items-center gap-2 pt-0.5">
          <div className="flex-1 h-3.5 bg-[#F3EEFA] rounded-full overflow-hidden border border-[#E9E4F5] relative">
            <div
              className="h-full rounded-full transition-all duration-500 shadow-inner"
              style={{
                width: `${completionPercent}%`,
                backgroundImage: 'repeating-linear-gradient(45deg, #9D82F2, #9D82F2 10px, #BFAEF8 10px, #BFAEF8 20px)'
              }}
            />
          </div>
          {/* Sparkle icon at the end */}
          <span className="text-[#9D82F2] text-sm animate-pulse">✦</span>
        </div>
      </div>

      {/* Clean notebook container with transparent background */}
      <div className="relative py-4 pointer-events-none z-10">

        {/* The beautiful white physical notebook page */}
        <div className="relative bg-white border border-[#E9E4F5] rounded-r-[24px] rounded-l-[10px] sm:rounded-r-[32px] sm:rounded-l-[14px] shadow-lg py-5 pr-3 pl-8 sm:py-8 sm:pr-8 sm:pl-10 min-h-[480px] flex flex-col justify-between pointer-events-auto">

          {/* Premium Ring Binder Loops — Spaced uniformly using a fixed CSS gap to prevent stretching/squishing on filter changes */}
          <div className="absolute left-[-16px] sm:left-[-16px] top-0 bottom-0 flex flex-col gap-6 py-8 overflow-hidden pointer-events-none z-20">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="relative flex items-center justify-center w-[32px] h-[28px]">
                <svg width="32" height="28" viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
                  <defs>
                    {/* Polished chrome front metal gradient */}
                    <linearGradient id={`metal-front-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#94a3b8" />
                      <stop offset="25%" stopColor="#f1f5f9" />
                      <stop offset="45%" stopColor="#ffffff" />
                      <stop offset="70%" stopColor="#cbd5e1" />
                      <stop offset="100%" stopColor="#475569" />
                    </linearGradient>
                  </defs>

                  {/* A. Reinforced purple eyelet matching the reference image */}
                  <circle cx="24" cy="14" r="5.5" fill="#b19ffb" stroke="#7c3aed" strokeWidth="1" />
                  <circle cx="24" cy="14" r="3.5" fill="#18142c" />

                  {/* B. Soft shadow inside the hole */}
                  <circle cx="24" cy="14" r="2.5" fill="#0f172a" opacity="0.3" filter="blur(1px)" />

                  {/* C. Single continuous oval wire loop (starts at x=17 behind page, loops left to x=8, enters hole at 24,14) */}
                  <path
                    d="M 17 21 A 16 8 0 0 1 8 14 A 16 8 0 0 1 24 14"
                    fill="none"
                    stroke={`url(#metal-front-${i})`}
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                  {/* Subtle inner wire shine for 3D roundness */}
                  <path
                    d="M 17 21 A 16 8 0 0 1 8 14 A 16 8 0 0 1 24 14"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            ))}
          </div>
          {/* Notebook Paper Inner Area */}
          <div className="flex-1 flex flex-col justify-between">

            <div>
              {/* Notebook Header */}
              <div className="relative z-10 mb-6 pb-4 border-b border-[#F0EBFC] flex flex-col items-center text-center">

                {/* Title row — title centered, list button right (absolute) */}
                <div className="relative w-full flex items-center justify-center py-1">

                  {/* Title + sparkle — always centered regardless of side elements */}
                  <div className="relative flex items-center gap-1">

                    {/* Lavender sprig — positioned absolutely to the left of the centered title */}
                    <div className="absolute right-[calc(100%+14px)] top-1/2 -translate-y-1/2 select-none pointer-events-none shrink-0">
                      <LavenderSprig className="w-[48px] h-[64px] sm:w-[62px] sm:h-[84px] transform rotate-12" />
                    </div>

                    <h3 className="font-caveat text-4xl sm:text-[50px] font-bold text-[#533FA2] tracking-wide whitespace-nowrap leading-none">
                      Daily Chores
                    </h3>
                    <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-8 sm:h-8 shrink-0 select-none pointer-events-none">
                      <path d="M 20 5 C 20 15, 15 20, 5 20 C 15 20, 20 25, 20 35 C 20 25, 25 20, 35 20 C 25 20, 20 15, 20 5 Z" fill="#B39DFA" />
                      <path d="M 38 25 C 38 30, 35 32, 30 32 C 35 32, 38 34, 38 39 C 38 34, 41 32, 46 32 C 41 32, 38 30, 38 25 Z" fill="#C5B5FC" />
                      <path d="M 28 38 C 28 41, 26 42, 23 42 C 26 42, 28 43, 28 46 C 28 43, 30 42, 33 42 C 30 42, 28 41, 28 38 Z" fill="#DCD4FF" />
                    </svg>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="font-sans text-xs sm:text-sm font-medium text-[#7E7399] tracking-wider mt-2.5">
                  Small steps, a better you.
                </p>

                {/* Status Filter Bar */}
                <div className="w-full bg-[#FAF8FF] border border-[#EBE5F7] rounded-full p-1 flex items-center justify-between gap-1 mt-5 pointer-events-auto">
                  {[
                    { key: 'All', label: 'All', icon: <LayoutGrid className="w-3.5 h-3.5" fill="currentColor" /> },
                    { key: 'Completed', label: 'Completed', icon: <CheckCircle className="w-3.5 h-3.5" /> },
                    { key: 'Pending', label: 'Not Completed', icon: <Circle className="w-3.5 h-3.5" strokeDasharray="3 3" /> },
                  ].map((tab) => {
                    const isActive = statusFilter === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setStatusFilter(tab.key as 'All' | 'Completed' | 'Pending')}
                        className={`flex-1 py-2 px-1 sm:px-3 rounded-full text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap text-[#5C42A5] ${
                          isActive
                            ? 'bg-[#E5DCFC] shadow-xs'
                            : 'hover:bg-[#F3EEFA]/50'
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>


              {/* Task Items List */}
              {filteredTasks.length === 0 ? (
                <div className="relative z-10 py-16 text-center select-none">
                  <Sparkles className="w-12 h-12 text-[#BFAEF8] mx-auto mb-3 animate-pulse" />
                  <h4 className="font-caveat text-3xl font-extrabold text-[#3B2961]">Your Chore Book is Clean!</h4>
                  <p className="text-xs text-[#7E7399] font-sans mt-1 max-w-sm mx-auto leading-relaxed">
                    No tasks found. Use the "+" button below or create a chore to decorate your lovely planner page.
                  </p>
                </div>
              ) : (
                <div className="relative z-10 space-y-3 pb-6 mt-6">
                  {filteredTasks.map((task) => {
                    const assignees = getAssigneeProfiles(task.assignedTo);
                    const isCompleted = task.status === 'Completed';

                    return (
                      <div
                        key={task.id}
                        className="bg-white rounded-[20px] sm:rounded-[24px] p-2.5 sm:p-5 border border-[#F0EBF9] shadow-xs hover:shadow-md transition-all relative flex gap-2.5 sm:gap-4 group overflow-hidden"
                      >
                        {/* Left column: Checkbox */}
                        <div className="flex flex-col items-center shrink-0 pt-0.5">
                          {isCompleted ? (
                            <button
                              onClick={() => onToggleComplete(task)}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-[6px] sm:rounded-[8px] bg-[#9D82F2] border border-[#9D82F2] flex items-center justify-center text-white cursor-pointer hover:bg-purple-600 transition-colors shrink-0"
                            >
                              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onToggleComplete(task)}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-[6px] sm:rounded-[8px] border-2 border-[#E0D9F0] hover:border-purple-400 bg-white transition-all cursor-pointer shrink-0"
                            />
                          )}
                        </div>

                        {/* Right column: All text details and actions */}
                        <div className="flex-1 min-w-0 flex flex-col gap-1 sm:gap-1.5">
                          {/* Title block with category icon */}
                          <div className="flex items-start gap-1.5 sm:gap-2">
                            <span className="text-sm sm:text-lg select-none shrink-0 mt-0.5">
                              {task.category === 'Chore' && '🧹'}
                              {task.category === 'Routine' && '🔄'}
                              {task.category === 'Exercise' && '🏃‍♂️'}
                              {task.category === 'Goal' && '🎯'}
                            </span>
                            <h4 className={`font-sans font-bold text-xs sm:text-base text-[#3B2961] tracking-wide leading-snug transition-all ${isCompleted ? 'line-through text-slate-400 opacity-70' : ''
                              }`}>
                              {task.title}
                            </h4>
                          </div>

                          {/* Description */}
                          {task.description && (
                            <p className={`text-[11px] sm:text-[13px] text-[#7E7399] font-medium leading-relaxed pl-1 ${isCompleted ? 'line-through text-slate-400/60' : ''
                              }`}>
                              {task.description}
                            </p>
                          )}

                          {/* Clock, XP reward and Completion bubble row */}
                          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 pt-0.5 pl-1">
                            {task.timeOfDay && (
                              <span className="flex items-center gap-1 text-[10px] sm:text-xs text-[#7E7399] font-medium">
                                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#A699C7]" />
                                <span>{task.timeOfDay}</span>
                              </span>
                            )}

                            {task.timeOfDay && <span className="text-[#E1D8F5] text-[10px] sm:text-xs">|</span>}

                            <span className="flex items-center gap-1 text-[10px] sm:text-xs text-[#C19519] font-bold">
                              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#F6C644] text-[#C19519]" />
                              <span>+{task.xpReward} XP</span>
                            </span>
                          </div>

                          {/* Bottom footer row containing assignee details & edit actions */}
                          <div className="flex items-center justify-between gap-2 border-t border-[#F5F0FC] pt-2 mt-1.5 pl-1">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] sm:text-xs text-[#A699C7] font-medium">Assigned:</span>
                              <div className="flex -space-x-1.5 overflow-hidden">
                                {assignees.map((member) => (
                                  <div
                                    key={member.uid}
                                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#F0EBFC] border-2 border-white flex items-center justify-center text-[10px] sm:text-xs shadow-xs"
                                    title={member.displayName}
                                  >
                                    {member.avatarEmoji}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-0.5 text-[#A699C7]">
                              {onEditTaskClick && (
                                <button
                                  onClick={() => onEditTaskClick(task)}
                                  className="p-1 sm:p-1.5 hover:bg-[#F3EEFA] hover:text-[#7A63D4] rounded-lg transition-all cursor-pointer"
                                  title="Edit Chore"
                                >
                                  <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                              )}
                              <span className="h-3 w-[1px] bg-[#E1D8F5] mx-0.5" />
                              <button
                                onClick={() => onDeleteTask(task.id)}
                                className="p-1 sm:p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all cursor-pointer"
                                title="Delete Chore"
                              >
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>


            {/* Notebook Bottom Footer block mimicking the sticker layout in the screenshot */}
            <div className="relative z-10 border-t border-dashed border-[#E1D8F5] pt-6 mt-10 space-y-5">

              <div className="bg-[#FAF8FF] border border-[#E9E4F5] rounded-[24px] p-4 flex items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F3EEFA] flex items-center justify-center text-[#9D82F2] shadow-xs">
                    <Heart className="w-5 h-5 fill-[#9D82F2] text-[#9D82F2]" />
                  </div>
                  <div>
                    <h4 className="font-caveat text-xl sm:text-2xl font-bold text-[#4B307E] leading-none">
                      Progress, not perfection.
                    </h4>
                    <p className="text-xs text-[#7E7399] mt-1 font-sans font-medium">
                      You've got this! ✦
                    </p>
                  </div>
                </div>

                {/* Circular action button '+' to create task inside the notebook sheet */}
                {onCreateTaskClick && (
                  <button
                    onClick={() => {
                      onCreateTaskClick();
                      try {
                        soundEffects.playChime();
                      } catch (e) { }
                    }}
                    className="w-12 h-12 rounded-[16px] bg-[#9D82F2] hover:bg-purple-600 text-white shadow-sm shadow-[#9D82F2]/25 flex items-center justify-center transition-all duration-200 transform active:scale-95 cursor-pointer shrink-0"
                    title="Create New Task"
                  >
                    <Plus className="w-6 h-6 stroke-[3]" />
                  </button>
                )}
              </div>

              {/* Mood selector card embedded at the absolute bottom margin */}
              <div className="flex flex-col items-center gap-2 bg-[#FAF8FF]/60 border border-[#FAF8FF] hover:bg-[#FAF8FF]/90 transition-colors rounded-2xl p-3 shadow-xs">
                <span className="font-sans text-xs font-bold text-[#7E7399] tracking-wide select-none">
                  My Mood Today:
                </span>
                <div className="flex items-center justify-center gap-3">
                  {[
                    { emoji: '😊', label: 'Happy' },
                    { emoji: '💪', label: 'Productive' },
                    { emoji: '🥳', label: 'Excited' },
                    { emoji: '😌', label: 'Relaxed' },
                    { emoji: '😴', label: 'Tired' },
                    { emoji: '🧠', label: 'Focused' }
                  ].map((m) => {
                    const isSelected = selectedMood === m.emoji;
                    return (
                      <button
                        key={m.emoji}
                        onClick={() => handleMoodSelect(m.emoji)}
                        className={`text-2xl transition-all duration-150 hover:scale-125 hover:-rotate-6 filter cursor-pointer ${isSelected
                            ? 'scale-125 drop-shadow-md rotate-[-6deg] opacity-100 ring-2 ring-[#BFAEF8] ring-offset-2 rounded-full p-0.5 bg-white'
                            : selectedMood
                              ? 'opacity-45 grayscale-[25%] hover:opacity-100 hover:grayscale-0'
                              : 'opacity-85 hover:opacity-100'
                          }`}
                        title={m.label}
                      >
                        {m.emoji}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
