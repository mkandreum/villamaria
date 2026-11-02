import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export const Toast: React.FC<{ toast: ToastState | null; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex justify-center px-4 pt-[max(env(safe-area-inset-top),12px)] pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.message}
            role={toast.type === 'error' ? 'alert' : 'status'}
            initial={{ opacity: 0, y: -24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={onDismiss}
            className={`pointer-events-auto max-w-md w-full flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur-xl border ${
              toast.type === 'error'
                ? 'bg-red-950/95 text-red-50 border-red-400/40'
                : 'bg-emerald-950/95 text-emerald-50 border-emerald-400/40'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-300" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-300" />
            )}
            <span className="leading-snug">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
