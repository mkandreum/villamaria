import React from 'react';
import { Calendar, MessageCircle, CheckCircle2 } from 'lucide-react';
import { PROPERTY_INFO } from '../data/mockData';

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

  const waMessage = hasDatesSelected
    ? `Hola Villa María 🌴, me gustaría reservar del ${checkIn} al ${checkOut} (Total: ${totalPrice}€).`
    : `Hola Villa María 🌴, me gustaría solicitar información y disponibilidad.`;

  const waUrl = `https://wa.me/${PROPERTY_INFO.phoneWhatsApp.replace('+', '')}?text=${encodeURIComponent(
    waMessage
  )}`;

  return (
    <div className="fixed bottom-[78px] left-1/2 -translate-x-1/2 z-40 md:hidden w-[88%] max-w-xs bg-emerald-950/95 text-emerald-100 border border-emerald-400/40 shadow-xl rounded-xl p-2 px-3 font-sans backdrop-blur-xl transition-all duration-300">
      <div className="flex items-center justify-between gap-2 w-full">
        {/* Price & Info */}
        <div className="flex flex-col">
          {hasDatesSelected ? (
            <>
              <span className="text-[8px] text-emerald-300 font-bold uppercase tracking-wider">
                {nights} {nights === 1 ? 'noche' : 'noches'} 📅
              </span>
              <span className="text-sm font-serif font-bold text-white leading-none mt-0.5">
                {totalPrice}€ <span className="text-[9px] font-sans font-normal text-emerald-300">total</span>
              </span>
            </>
          ) : (
            <>
              <span className="text-[8px] text-emerald-300 uppercase tracking-widest font-semibold">
                Villa María 🌴
              </span>
              <span className="text-xs font-serif font-bold text-white leading-none mt-0.5">
                Desde 150€ <span className="text-[9px] font-sans font-normal text-emerald-300">/noche</span>
              </span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-lg bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm"
            title="Chat WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
          </a>

          {hasDatesSelected ? (
            <button
              onClick={onOpenBooking}
              className="bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-950 font-bold py-1 px-2.5 rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md active:scale-95 transition-all min-h-[30px]"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Reservar</span>
            </button>
          ) : (
            <button
              onClick={onScrollToCalendar}
              className="bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-950 font-bold py-1 px-2.5 rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md active:scale-95 transition-all min-h-[30px]"
            >
              <Calendar className="w-3 h-3 text-emerald-950" />
              <span>Fechas</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
