import { ReactNode, useRef } from 'react';
import { AnimatePresence, motion, Variants } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { soundEffects } from '../../utils/audio';

// One metal ring through a punched hole. Tiled vertically as a background, so a page of any height
// gets rings without rendering dozens of SVG nodes.
const RING_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="46" viewBox="0 0 40 46">
<defs><linearGradient id="m" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#8E9AAE"/><stop offset=".35" stop-color="#F4F6FA"/><stop offset=".55" stop-color="#FFFFFF"/>
<stop offset=".8" stop-color="#B9C2D0"/><stop offset="1" stop-color="#5D6A80"/></linearGradient></defs>
<circle cx="31" cy="23" r="4.6" fill="#000" fill-opacity=".28"/>
<circle cx="31" cy="23" r="3.4" fill="#000" fill-opacity=".45"/>
<path d="M23 31 C 8 31, 3 24, 6 18 C 9 12, 22 12, 31 23" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="5" stroke-linecap="round" transform="translate(1 2)"/>
<path d="M23 31 C 8 31, 3 24, 6 18 C 9 12, 22 12, 31 23" fill="none" stroke="url(#m)" stroke-width="4.2" stroke-linecap="round"/>
<path d="M21 29.5 C 9 29, 5.5 24, 8 19" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.1" stroke-linecap="round"/>
</svg>`;
const RING_URL = `url("data:image/svg+xml,${encodeURIComponent(RING_SVG)}")`;

export interface NotebookTab {
  key: string;
  label: string;
  count?: number;
}

interface NotebookPageProps {
  // Either a custom header, or a simple handwritten title + subtitle
  header?: ReactNode;
  title?: string;
  subtitle?: string;
  aside?: ReactNode;
  tabs?: NotebookTab[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  children: ReactNode;
}

const TURN = { duration: 0.9, ease: [0.4, 0.1, 0.2, 1] as const };

// Pages are hinged at the binder rings (left edge). Moving forward, the current sheet lifts and turns
// away to reveal the next one beneath it; moving back, the previous sheet turns back over on top.
const pageVariants: Variants = {
  enter: (dir: number) => (dir > 0
    ? { rotateY: 0, zIndex: 0 }
    : { rotateY: -96, zIndex: 2 }),
  center: { rotateY: 0, zIndex: 1, transition: TURN },
  exit: (dir: number) => (dir > 0
    ? { rotateY: -96, zIndex: 2, transition: TURN }
    : { rotateY: 0, zIndex: 0, transition: TURN }),
};

// A shadow that darkens the sheet as it tilts away from the light
const shadeVariants: Variants = {
  enter: (dir: number) => ({ opacity: dir > 0 ? 0.25 : 0.5 }),
  center: { opacity: 0, transition: TURN },
  exit: (dir: number) => ({ opacity: dir > 0 ? 0.5 : 0.25, transition: TURN }),
};

export default function NotebookPage({ header, title, subtitle, aside, tabs, activeTab, onTabChange, children }: NotebookPageProps) {
  const index = tabs ? Math.max(0, tabs.findIndex(t => t.key === activeTab)) : 0;
  const prev = useRef({ index, direction: 1 });
  if (prev.current.index !== index) {
    prev.current = { index, direction: index > prev.current.index ? 1 : -1 };
  }
  const direction = prev.current.direction;
  const pageKey = tabs ? activeTab : 'page';

  return (
    <section className="notebook">
      {tabs && (
        <div className="flex justify-end gap-1.5 pr-6 relative z-[1]" role="tablist" aria-label="Notebook pages">
          {tabs.map(t => {
            const active = t.key === activeTab;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={active}
                onClick={() => {
                  if (active) return;
                  soundEffects.playPageTurn();
                  onTabChange?.(t.key);
                }}
                className={`notebook-tab relative -mb-px px-4 pt-2 pb-3 rounded-t-[14px] border border-b-0 font-hand text-[17px] leading-none cursor-pointer transition-transform duration-200 ${
                  active ? 'notebook-tab-active text-ink z-[2]' : 'text-muted translate-y-1.5 hover:translate-y-0.5'
                }`}
              >
                {t.label}
                {t.count !== undefined && (
                  <motion.span
                    key={t.count}
                    initial={{ scale: 1.6 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 14 }}
                    className={`inline-flex ml-1.5 min-w-[20px] h-[20px] px-1 rounded-full text-[12px] font-sans font-bold items-center justify-center ${
                      active ? 'bg-primary text-on-primary' : 'bg-line text-muted'
                    }`}
                  >
                    {t.count}
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="relative pl-[18px]">
        <div className="notebook-rings" style={{ backgroundImage: RING_URL }} aria-hidden="true" />
        {/* A sheet always lies underneath, so a turning page never reveals empty space */}
        <div className="notebook-paper notebook-under" aria-hidden="true" />
        <div className="relative" style={{ perspective: 1800 }}>
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={pageKey}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="notebook-paper pt-5 pb-6"
              style={{ transformOrigin: 'left center', backfaceVisibility: 'hidden' }}
              role={tabs ? 'tabpanel' : undefined}
            >
              <motion.div
                custom={direction}
                variants={shadeVariants}
                initial={false}
                className="absolute inset-0 rounded-[inherit] pointer-events-none bg-gradient-to-r from-black/5 via-black/15 to-black/35 z-10"
                aria-hidden="true"
              />
              {header ?? (
                <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 pb-3 ruled-line page-text">
                  <div className="min-w-0">
                    <h2 className="font-script text-[32px] sm:text-[40px] leading-none font-bold text-primary whitespace-nowrap">{title}</h2>
                    {subtitle && <p className="font-hand text-[15px] text-muted mt-1">{subtitle}</p>}
                  </div>
                  {aside && <div className="shrink-0 pt-1">{aside}</div>}
                </header>
              )}
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

interface NotebookHeadingProps {
  children: ReactNode;
  count?: number;
  tone?: 'ink' | 'danger';
  // When given, the heading folds its section open and closed
  open?: boolean;
  onToggle?: () => void;
}

// Handwritten section label that sits on the page like a margin note
export const NotebookHeading = ({ children, count, tone = 'ink', open, onToggle }: NotebookHeadingProps) => {
  const content = (
    <>
      <span className={`font-script text-[26px] leading-none font-bold ${tone === 'danger' ? 'text-danger' : 'text-ink'}`}>
        {children}
      </span>
      {count !== undefined && <span className="font-hand text-sm text-faint">({count})</span>}
    </>
  );
  if (!onToggle) return <div className="flex items-baseline gap-2 pt-5 pb-1 page-text">{content}</div>;
  return (
    <button onClick={onToggle} aria-expanded={open} className="w-full flex items-baseline gap-2 pt-5 pb-1 page-text text-left cursor-pointer">
      {content}
      <ChevronDown className={`ml-auto self-center w-4 h-4 text-faint transition-transform ${open ? '' : '-rotate-90'}`} />
    </button>
  );
};
