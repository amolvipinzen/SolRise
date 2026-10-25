import { FormEvent, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Pencil } from 'lucide-react';
import { DailyCheckin } from '../../types';
import { MOODS } from '../../lib/messages';
import { dayKey } from '../../lib/dates';
import { soundEffects } from '../../utils/audio';

interface CheckinCardProps {
  checkin?: DailyCheckin;
  onSave: (patch: Partial<DailyCheckin>) => void;
}

// Morning: mood + one focus for the day. Evening: a one-line reflection.
export default function CheckinCard({ checkin, onSave }: CheckinCardProps) {
  const today = dayKey();
  const current = checkin?.date === today ? checkin : undefined;
  const [editingIntention, setEditingIntention] = useState(false);
  const [intention, setIntention] = useState(current?.intention || '');
  const [reflection, setReflection] = useState('');
  const hour = new Date().getHours();

  const mood = MOODS.find(m => m.emoji === current?.mood);
  const showIntentionInput = !!mood && (!current?.intention || editingIntention);
  const showReflection = hour >= 18 && !!current?.intention && !current?.reflection;

  const saveIntention = (e: FormEvent) => {
    e.preventDefault();
    if (!intention.trim()) return;
    soundEffects.playPop();
    onSave({ intention: intention.trim() });
    setEditingIntention(false);
  };

  const saveReflection = (e: FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) return;
    soundEffects.playPop();
    onSave({ reflection: reflection.trim() });
  };

  return (
    <section className="card p-4 sm:p-5">
      <AnimatePresence mode="wait" initial={false}>
        {!mood ? (
          <motion.div key="mood" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="font-semibold text-ink">How are you feeling today?</h2>
            <p className="text-sm text-muted mt-0.5">No wrong answers. It helps you plan a kinder day.</p>
            <div className="flex justify-between gap-1 mt-4">
              {MOODS.map(m => (
                <motion.button
                  key={m.emoji}
                  whileHover={{ scale: 1.12, rotate: -4 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    soundEffects.playTap();
                    onSave({ mood: m.emoji });
                  }}
                  className="flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl hover:bg-subtle cursor-pointer"
                  aria-label={m.label}
                >
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="text-[11px] font-semibold text-muted">{m.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="focus" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex items-start gap-3">
              <button
                onClick={() => onSave({ mood: '' })}
                className="text-3xl leading-none shrink-0 hover:scale-110 transition cursor-pointer"
                title="Change mood"
                aria-label={`Feeling ${mood.label}. Change mood`}
              >
                {mood.emoji}
              </button>
              <div className="flex-1 min-w-0">
                {showIntentionInput ? (
                  <>
                    <p className="text-sm text-muted">{mood.reply}</p>
                    <form onSubmit={saveIntention} className="mt-3">
                      <label htmlFor="intention" className="text-sm font-semibold text-ink">
                        Today, the one thing I want to focus on is…
                      </label>
                      <div className="flex gap-2 mt-2">
                        <input
                          id="intention"
                          value={intention}
                          onChange={e => setIntention(e.target.value)}
                          placeholder="e.g. being patient, finishing my report"
                          maxLength={80}
                          className="flex-1 min-w-0 bg-subtle rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                        <button
                          type="submit"
                          disabled={!intention.trim()}
                          className="px-4 rounded-xl bg-primary text-on-primary text-sm font-bold press cursor-pointer disabled:opacity-40"
                        >
                          Set
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="text-xs font-bold uppercase tracking-wider text-muted">Today's focus</div>
                    <button
                      onClick={() => setEditingIntention(true)}
                      className="group flex items-center gap-2 text-left cursor-pointer"
                    >
                      <span className="font-display text-xl font-semibold text-ink leading-snug">{current?.intention}</span>
                      <Pencil className="w-3.5 h-3.5 text-faint opacity-0 group-hover:opacity-100 transition shrink-0" />
                    </button>
                    {current?.reflection && (
                      <p className="text-sm text-muted mt-1">
                        Tonight you felt: <span className="font-semibold text-ink">{current.reflection}</span>
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {showReflection && (
              <form onSubmit={saveReflection} className="mt-4 pt-4 border-t border-line">
                <label htmlFor="reflection-card" className="text-sm font-semibold text-ink">
                  🌙 How did today feel?
                </label>
                <div className="flex gap-2 mt-2">
                  <input
                    id="reflection-card"
                    value={reflection}
                    onChange={e => setReflection(e.target.value)}
                    placeholder="One word or one line"
                    maxLength={60}
                    className="flex-1 min-w-0 bg-subtle rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    type="submit"
                    disabled={!reflection.trim()}
                    className="px-4 rounded-xl bg-primary text-on-primary text-sm font-bold press cursor-pointer disabled:opacity-40"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
