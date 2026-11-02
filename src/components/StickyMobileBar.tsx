import React from 'react';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../context/CurrencyContext';
import { AnimatedPrice } from './Motion';

interface StickyMobileBarProps {
  visible: boolean;
  checkIn: string;
  checkOut: string;
  totalPrice?: number;
  nights?: number;
  pricePerNight: number;
  onOpenBooking: () => void;
  onScrollToCalendar: () => void;
}

export const StickyMobileBar: React.FC<StickyMobileBarProps> = ({
  visible,
  checkIn,
  checkOut,
  totalPrice,
  nights,
  pricePerNight,
  onOpenBooking,
  onScrollToCalendar,
}) => {
  const hasDatesSelected = Boolean(checkIn && checkOut && totalPrice && totalPrice > 0);
  const { formatPrice } = useCurrency();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className="fixed left-1/2 -translate-x-1/2 bottom-[calc(88px+env(safe-area-inset-bottom))] z-40 md:hidden w-[calc(100%-24px)] max-w-sm bg-emerald-950/95 text-emerald-100 border border-emerald-400/30 shadow-2xl rounded-2xl p-2 pl-4 font-sans backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="flex flex-col min-w-0" aria-live="polite">
              {hasDatesSelected ? (
                <>
                  <span className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider truncate">
                    {nights} {nights === 1 ? 'noche' : 'noches'}
                  </span>
                  <span className="text-base font-serif font-bold text-white leading-tight truncate">
                    <AnimatedPrice value={totalPrice!} /> <span className="text-[11px] font-sans font-normal text-emerald-300">total</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[11px] text-emerald-300 uppercase tracking-wider font-semibold truncate">Villa María</span>
                  <span className="text-base font-serif font-bold text-white leading-tight truncate">
                    Desde {formatPrice(pricePerNight)} <span className="text-[11px] font-sans font-normal text-emerald-300">/noche</span>
                  </span>
                </>
              )}
            </div>

            <button
              onClick={hasDatesSelected ? onOpenBooking : onScrollToCalendar}
              className="shine shrink-0 bg-gradient-to-r from-emerald-400 to-teal-300 text-emerald-950 font-bold py-2 px-4 rounded-xl text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-transform min-h-[48px] cursor-pointer"
            >
              {hasDatesSelected ? <CheckCircle2 className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
              <span>{hasDatesSelected ? 'Reservar' : 'Ver fechas'}</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
