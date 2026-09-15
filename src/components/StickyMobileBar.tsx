import React from 'react';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

interface StickyMobileBarProps {
  checkIn: string;
  checkOut: string;
  totalPrice?: number;
  nights?: number;
  onOpenBooking: () => void;
  onScrollToCalendar: () => void;
}

export const StickyMobileBar: React.FC<StickyMobileBarProps> = ({
  checkIn,
  checkOut,
  totalPrice,
  nights,
  onOpenBooking,
  onScrollToCalendar,
}) => {
  const hasDatesSelected = checkIn && checkOut && totalPrice && totalPrice > 0;
  const { formatPrice } = useCurrency();
  const [visible, setVisible] = useState(true);

  React.useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 60) {
        setVisible(true);
        lastY = currentY;
        return;
      }

      const diff = currentY - lastY;
      if (Math.abs(diff) > 6) {
        if (diff > 0) {
          setVisible(false);
        } else {
          setVisible(true);
        }
        lastY = currentY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-[74px] sm:bottom-[78px] left-1/2 -translate-x-1/2 z-40 md:hidden w-[90%] max-w-sm bg-emerald-950/95 text-emerald-100 border border-emerald-400/40 shadow-2xl rounded-2xl p-2 px-3.5 font-sans backdrop-blur-xl transition-all duration-300 ease-in-out ${
        visible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-36 opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-between gap-3 w-full">
        {/* Price & Info */}
        <div className="flex flex-col min-w-0">
          {hasDatesSelected ? (
            <>
              <span className="text-[9px] text-emerald-300 font-bold uppercase tracking-wider truncate">
                {nights} {nights === 1 ? 'noche' : 'noches'} 📅
              </span>
              <span className="text-sm font-serif font-bold text-white leading-none mt-0.5 truncate">
                {formatPrice(totalPrice)} <span className="text-[10px] font-sans font-normal text-emerald-300">total</span>
              </span>
            </>
          ) : (
            <>
              <span className="text-[9px] text-emerald-300 uppercase tracking-widest font-semibold truncate">
                Villa María 🌴
              </span>
              <span className="text-xs font-serif font-bold text-white leading-none mt-0.5 truncate">
                Desde {formatPrice(150)} <span className="text-[10px] font-sans font-normal text-emerald-300">/noche</span>
              </span>
            </>
          )}
        </div>

        {/* Action Button Only */}
        <div className="shrink-0">
          {hasDatesSelected ? (
            <button
              onClick={onOpenBooking}
              className="bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-950 font-bold py-2 px-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all min-h-[44px] cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Reservar</span>
            </button>
          ) : (
            <button
              onClick={onScrollToCalendar}
              className="bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-950 font-bold py-2 px-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all min-h-[44px] cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-950" />
              <span>Fechas</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
