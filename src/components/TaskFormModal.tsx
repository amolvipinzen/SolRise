import React, { useState } from 'react';
import { Task, TaskCategory, TaskFrequency, TaskDifficulty, UserProfile } from '../types';
import { X, Calendar, Clock, Trophy, HelpCircle, CheckSquare } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface TaskFormModalProps {
  familyMembers: UserProfile[];
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'status' | 'streak' | 'createdAt' | 'createdById'>) => void;
  taskToEdit?: Task;
}

export default function TaskFormModal({ familyMembers, onClose, onSave, taskToEdit }: TaskFormModalProps) {
  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [category, setCategory] = useState<TaskCategory>(taskToEdit?.category || 'Chore');
  const [frequency, setFrequency] = useState<TaskFrequency>(taskToEdit?.frequency || 'Daily');
  const [difficulty, setDifficulty] = useState<TaskDifficulty>(taskToEdit?.difficulty || 'Medium');
  const [assignedTo, setAssignedTo] = useState<string[]>(taskToEdit?.assignedTo || []);
  const [timeOfDay, setTimeOfDay] = useState(taskToEdit?.timeOfDay || '12:00');
  const [deadlineDate, setDeadlineDate] = useState(taskToEdit?.deadlineDate || '');

  const [isRecurring, setIsRecurring] = useState(taskToEdit?.isRecurring || false);
  const [recurrenceInterval, setRecurrenceInterval] = useState(taskToEdit?.recurrenceInterval || 1);
  const [recurrenceDurationType, setRecurrenceDurationType] = useState<'indefinite' | 'occurrences' | 'date'>(
    taskToEdit?.recurrenceDurationType || 'indefinite'
  );
  const [recurrenceDurationValue, setRecurrenceDurationValue] = useState(
    taskToEdit?.recurrenceDurationValue || 5
  );
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(taskToEdit?.recurrenceEndDate || '');

  // Auto calculate reward XP based on difficulty & frequency
  const calculateXPReward = (diff: TaskDifficulty, freq: TaskFrequency) => {
    let base = 10;
    if (diff === 'Medium') base = 20;
    if (diff === 'Hard') base = 40;

    // Weekly/monthly tasks give extra bonuses
    if (freq === 'Weekly') base += 10;
    if (freq === 'Monthly') base += 25;
    return base;
  };

  const xpReward = calculateXPReward(difficulty, frequency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      frequency,
      assignedTo: assignedTo.length > 0 ? assignedTo : familyMembers.map(m => m.uid), // assign to everyone if empty
      timeOfDay,
      deadlineDate: frequency !== 'Daily' ? deadlineDate : undefined,
      xpReward,
      difficulty,
      isRecurring,
      recurrenceInterval: isRecurring ? recurrenceInterval : undefined,
      recurrenceDurationType: isRecurring ? recurrenceDurationType : undefined,
      recurrenceDurationValue: (isRecurring && recurrenceDurationType === 'occurrences') ? recurrenceDurationValue : undefined,
      recurrenceEndDate: (isRecurring && recurrenceDurationType === 'date') ? recurrenceEndDate : undefined
    });

    soundEffects.playChime();
  };

  const handleToggleAssignee = (uid: string) => {
    if (assignedTo.includes(uid)) {
      setAssignedTo(assignedTo.filter(id => id !== uid));
    } else {
      setAssignedTo([...assignedTo, uid]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-900/40 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto paper-card bg-white p-5 sm:p-6 border-2 border-purple-300 relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-purple-100 rounded-full text-purple-400 hover:text-purple-700 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <h3 className="font-caveat text-3xl font-bold text-purple-900 flex items-center gap-2">
            {taskToEdit ? '✏️ Edit Family Task' : '✏️ Create Family Task'}
          </h3>
          <p className="text-xs text-purple-500 font-medium font-sans">
            {taskToEdit ? 'Update details of this family task.' : 'Design a new chore, daily habit, core exercise, or shared family goal.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
              Task Title / Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Empty Dishwasher 🍽️, Math Homework 📚, Water plants 🌱"
              className="w-full px-4 py-2 bg-purple-50/50 border-2 border-purple-100 rounded-xl focus:border-purple-300 focus:outline-none font-sans font-medium text-purple-950 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
              Quick Instructions
            </label>
            <textarea
              placeholder="e.g. Wipe the table, separate plastics, put away clean cups."
              className="w-full px-4 py-2 bg-purple-50/50 border-2 border-purple-100 rounded-xl focus:border-purple-300 focus:outline-none font-sans font-medium text-purple-950 text-sm h-16 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Grid: Category, Frequency, Difficulty (single-column on mobile to avoid squishing and truncation) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
                Type
              </label>
              <select
                className="w-full px-3 py-1.5 bg-purple-50/50 border-2 border-purple-100 rounded-xl text-xs font-bold text-purple-900 focus:border-purple-300 focus:outline-none cursor-pointer"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
              >
                <option value="Chore">🧹 Chore</option>
                <option value="Routine">🌱 Routine</option>
                <option value="Exercise">🏃‍♂️ Exercise</option>
                <option value="Goal">🎯 Goal</option>
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
                How Often?
              </label>
              <select
                className="w-full px-3 py-1.5 bg-purple-50/50 border-2 border-purple-100 rounded-xl text-xs font-bold text-purple-900 focus:border-purple-300 focus:outline-none cursor-pointer"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as TaskFrequency)}
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="One-time">One-Time</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
                Difficulty
              </label>
              <select
                className="w-full px-3 py-1.5 bg-purple-50/50 border-2 border-purple-100 rounded-xl text-xs font-bold text-purple-900 focus:border-purple-300 focus:outline-none cursor-pointer"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as TaskDifficulty)}
              >
                <option value="Easy">Easy (10 XP)</option>
                <option value="Medium">Medium (20 XP)</option>
                <option value="Hard">Hard (40 XP)</option>
              </select>
            </div>

          </div>

          {/* Grid: Notification Deadlines (single-column on mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-purple-50/30 p-3 rounded-xl border border-purple-100">
            
            {/* Time of Day */}
            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5" />
                Alert Time
              </label>
              <input
                type="time"
                className="w-full px-3 py-1.5 bg-white border-2 border-purple-100 rounded-xl text-xs font-medium text-purple-900 focus:border-purple-300 focus:outline-none"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
              />
            </div>

            {/* Specific Date */}
            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
                <Calendar className="w-3.5 h-3.5" />
                Target Date
              </label>
              <input
                type="date"
                disabled={frequency === 'Daily'}
                className="w-full px-3 py-1.5 bg-white border-2 border-purple-100 rounded-xl text-xs font-medium text-purple-900 focus:border-purple-300 focus:outline-none disabled:opacity-50"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
              />
            </div>

          </div>

          {/* Recurring Task Settings Card */}
          <div className="bg-purple-50/35 p-3.5 rounded-xl border border-purple-100/80 space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500 cursor-pointer"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
              />
              <span className="flex items-center gap-1.5">
                <span>🔄 Make this a recurring task</span>
              </span>
            </label>

            {isRecurring && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-purple-100/60 animate-in fade-in duration-200">
                {/* Repeat Interval */}
                <div>
                  <label className="block text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1">
                    Repeat Every
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      className="w-20 px-3 py-1.5 bg-white border-2 border-purple-100 rounded-xl text-xs font-semibold text-purple-900 focus:border-purple-300 focus:outline-none"
                      value={recurrenceInterval}
                      onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                    />
                    <span className="text-xs text-purple-700 font-bold">
                      {frequency === 'Daily' && (recurrenceInterval === 1 ? 'day' : 'days')}
                      {frequency === 'Weekly' && (recurrenceInterval === 1 ? 'week' : 'weeks')}
                      {frequency === 'Monthly' && (recurrenceInterval === 1 ? 'month' : 'months')}
                      {frequency === 'One-time' && (recurrenceInterval === 1 ? 'day' : 'days')}
                    </span>
                  </div>
                </div>

                {/* Duration/End Condition */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1">
                      Recurring Duration
                    </label>
                    <select
                      className="w-full px-3 py-1.5 bg-white border-2 border-purple-100 rounded-xl text-xs font-bold text-purple-900 focus:border-purple-300 focus:outline-none cursor-pointer"
                      value={recurrenceDurationType}
                      onChange={(e) => setRecurrenceDurationType(e.target.value as any)}
                    >
                      <option value="indefinite">Indefinitely</option>
                      <option value="occurrences">Specific occurrences</option>
                      <option value="date">Specific end date</option>
                    </select>
                  </div>

                  {recurrenceDurationType === 'occurrences' && (
                    <div className="animate-in fade-in duration-200">
                      <label className="block text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1">
                        Number of times
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="w-full px-3 py-1.5 bg-white border-2 border-purple-100 rounded-xl text-xs font-semibold text-purple-900 focus:border-purple-300 focus:outline-none"
                        value={recurrenceDurationValue}
                        onChange={(e) => setRecurrenceDurationValue(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  )}

                  {recurrenceDurationType === 'date' && (
                    <div className="animate-in fade-in duration-200">
                      <label className="block text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1">
                        End date
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full px-3 py-1.5 bg-white border-2 border-purple-100 rounded-xl text-xs font-semibold text-purple-900 focus:border-purple-300 focus:outline-none"
                        value={recurrenceEndDate}
                        onChange={(e) => setRecurrenceEndDate(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Assign To: Avatars Grid */}
          <div>
            <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
              Assign To (Select family members)
            </label>
            <div className="flex flex-wrap gap-2 p-2 bg-purple-50/30 border border-purple-100 rounded-xl">
              {familyMembers.map((member) => {
                const isSelected = assignedTo.includes(member.uid);
                return (
                  <button
                    key={member.uid}
                    type="button"
                    onClick={() => handleToggleAssignee(member.uid)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                      isSelected 
                        ? 'bg-purple-200 border-purple-400 text-purple-900 scale-105'
                        : 'bg-white border-purple-100 text-purple-600 hover:border-purple-200'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center bg-purple-100 shrink-0">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.displayName} className="w-full h-full object-cover select-none" />
                      ) : (
                        <span className="select-none text-xs">{member.avatarEmoji}</span>
                      )}
                    </span>
                    <span>{member.displayName}</span>
                    <span className="text-[10px] text-purple-400 font-normal">({member.role})</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-purple-400 font-medium mt-1">
              * If none are selected, the task is assigned to everyone in the family circle!
            </p>
          </div>

          {/* Reward Alert Indicator */}
          <div className="flex items-center gap-2 bg-purple-100/50 p-2.5 rounded-xl border border-dashed border-purple-300 text-purple-950 text-xs font-bold">
            <Trophy className="w-4 h-4 text-amber-500 animate-bounce" />
            <span>This task awards +{xpReward} XP to whoever completes it!</span>
          </div>

          {/* Footer Save */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-white border-2 border-purple-200 hover:bg-purple-50 text-purple-700 font-bold rounded-xl text-sm transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
            >
              {taskToEdit ? 'Save Changes ✨' : 'Create Task ✨'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
