import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

/** Dates are stored at UTC midnight, so they are always read back in UTC (no day-off shifts). */
export const fmtDate = (d: string | Date, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) =>
  new Date(d).toLocaleDateString('es-ES', { ...opts, timeZone: 'UTC' });
export const ymd = (d: string | Date) => new Date(d).toISOString().slice(0, 10);
export const todayYmd = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
};
export const nightsBetween = (a: string | Date, b: string | Date) =>
  Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
export const money = (n: number) => `US$ ${Math.round(Number(n) || 0).toLocaleString('en-US')}`;

export const STATUS: Record<string, { label: string; dot: string; chip: string }> = {
  CONFIRMED: { label: 'Confirmada', dot: 'bg-emerald-400', chip: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30' },
  PENDING: { label: 'Pendiente', dot: 'bg-amber-400', chip: 'bg-amber-400/15 text-amber-300 border-amber-400/30' },
  CANCELLED: { label: 'Cancelada', dot: 'bg-rose-400', chip: 'bg-rose-400/15 text-rose-300 border-rose-400/30' },
  COMPLETED: { label: 'Completada', dot: 'bg-sky-400', chip: 'bg-sky-400/15 text-sky-300 border-sky-400/30' },
};

export const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => (
  <div className={`rounded-2xl bg-emerald-900/35 border border-emerald-400/15 p-4 ${className}`}>{children}</div>
);

export const SectionTitle: React.FC<{ title: string; hint?: string; action?: React.ReactNode }> = ({ title, hint, action }) => (
  <div className="flex items-end justify-between gap-3 px-1 mb-2.5">
    <div className="min-w-0">
      <h3 className="font-serif text-lg font-bold text-white leading-tight">{title}</h3>
      {hint && <p className="text-xs text-emerald-200/60 mt-0.5 text-pretty">{hint}</p>}
    </div>
    {action}
  </div>
);

const inputBase =
  'w-full rounded-xl bg-emerald-950/80 border border-emerald-400/20 px-3.5 text-[15px] text-emerald-50 placeholder:text-emerald-200/30 focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/20 transition-colors';

export const Field: React.FC<{
  label: string;
  hint?: string;
  children?: React.ReactNode;
  value?: string | number;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  suffix?: string;
}> = ({ label, hint, children, value, onChange, placeholder, type = 'text', multiline, rows = 3, inputMode, suffix }) => (
  <label className="block">
    <span className="block text-[13px] font-semibold text-emerald-100 mb-1.5">{label}</span>
    {children ? (
      children
    ) : multiline ? (
      <textarea
        rows={rows}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className={`${inputBase} py-3 leading-relaxed resize-y`}
      />
    ) : (
      <span className="relative block">
        <input
          type={type}
          inputMode={inputMode}
          value={value ?? ''}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          className={`${inputBase} min-h-[48px] ${suffix ? 'pr-14' : ''}`}
        />
        {suffix && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-200/50">{suffix}</span>}
      </span>
    )}
    {hint && <span className="block text-xs text-emerald-200/50 mt-1.5 text-pretty">{hint}</span>}
  </label>
);

export const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }> = ({
  checked,
  onChange,
  label,
  hint,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="w-full flex items-center justify-between gap-4 text-left min-h-[52px] cursor-pointer"
  >
    <span className="min-w-0">
      <span className="block text-[15px] font-semibold text-emerald-50">{label}</span>
      {hint && <span className="block text-xs text-emerald-200/55 mt-0.5 text-pretty">{hint}</span>}
    </span>
    <span className={`relative shrink-0 w-12 h-7 rounded-full transition-colors duration-200 ${checked ? 'bg-emerald-400' : 'bg-emerald-950 border border-emerald-400/25'}`}>
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full shadow transition-transform duration-200 ${
          checked ? 'translate-x-5 bg-emerald-950' : 'bg-emerald-200/60'
        }`}
      />
    </span>
  </button>
);

export const Btn: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'primary' | 'soft' | 'danger' | 'warn' | 'wa'; block?: boolean }
> = ({ tone = 'soft', block, className = '', children, ...rest }) => {
  const tones = {
    primary: 'bg-emerald-400 text-emerald-950 hover:bg-emerald-300',
    soft: 'bg-emerald-800/60 text-emerald-100 border border-emerald-400/20 hover:bg-emerald-800',
    danger: 'bg-rose-500/15 text-rose-200 border border-rose-400/30 hover:bg-rose-500/25',
    warn: 'bg-amber-400/15 text-amber-200 border border-amber-400/30 hover:bg-amber-400/25',
    wa: 'bg-[#25D366] text-white hover:bg-[#20bd5a]',
  };
  return (
    <button
      {...rest}
      className={`min-h-[48px] px-4 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50 cursor-pointer ${tones[tone]} ${block ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export const Chip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; count?: number }> = ({
  active,
  onClick,
  children,
  count,
}) => (
  <button
    onClick={onClick}
    className={`shrink-0 min-h-[40px] px-3.5 rounded-full text-[13px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
      active ? 'bg-emerald-400 text-emerald-950' : 'bg-emerald-900/60 text-emerald-100/80 border border-emerald-400/15'
    }`}
  >
    {children}
    {count !== undefined && <span className={`ml-1.5 tabular-nums ${active ? 'text-emerald-950/70' : 'text-emerald-200/50'}`}>{count}</span>}
  </button>
);

/** Bottom sheet: the one pattern for details and secondary actions on a phone. */
export const Sheet: React.FC<{ open: boolean; onClose: () => void; title?: string; children: React.ReactNode }> = ({
  open,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative w-full sm:max-w-lg max-h-[90dvh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-emerald-950 border border-emerald-400/20 shadow-2xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => info.offset.y > 120 && onClose()}
          >
            <div className="pt-2.5 pb-1 flex justify-center shrink-0 cursor-grab" aria-hidden>
              <span className="w-10 h-1.5 rounded-full bg-emerald-200/25" />
            </div>
            <div className="flex items-center justify-between gap-3 px-5 pb-3 shrink-0">
              <h3 className="font-serif text-xl font-bold text-white truncate">{title}</h3>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="w-11 h-11 -mr-2 rounded-full flex items-center justify-center text-emerald-200 hover:bg-emerald-800/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain px-5 pb-[max(env(safe-area-inset-bottom),20px)] space-y-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const Empty: React.FC<{ icon: React.ReactNode; title: string; text?: string }> = ({ icon, title, text }) => (
  <div className="text-center py-14 px-6">
    <div className="mx-auto w-14 h-14 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-300/70 mb-3">{icon}</div>
    <p className="font-serif text-lg text-white">{title}</p>
    {text && <p className="text-sm text-emerald-200/55 mt-1 text-pretty">{text}</p>}
  </div>
);

/** Reads a JSON-or-array setting safely. */
export const asList = <T,>(value: any, fallback: T[] = []): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === 'string' && value.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
};
