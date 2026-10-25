import { ReactNode, useEffect } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface SheetProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

// Bottom sheet on phones, centered dialog on larger screens. Wrap in <AnimatePresence>.
export default function Sheet({ title, subtitle, onClose, children, footer }: SheetProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%', opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        className="relative w-full sm:max-w-lg bg-surface rounded-t-[28px] sm:rounded-[28px] shadow-2xl max-h-[92vh] flex flex-col"
      >
        <div className="sm:hidden mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-line" />
        <div className="flex items-start justify-between gap-3 px-5 sm:px-6 pt-4 sm:pt-6 pb-3">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink leading-tight">{title}</h2>
            {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full text-muted hover:bg-subtle hover:text-ink transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 pb-4">{children}</div>
        {footer && <div className="px-5 sm:px-6 py-4 border-t border-line pb-safe">{footer}</div>}
      </motion.div>
    </div>
  );
}
