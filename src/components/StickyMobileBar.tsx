import React from 'react';
import { Calendar, MessageCircle, DollarSign, CheckCircle2 } from 'lucide-react';
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
    ? `Hola Villa María, quisiera consultar disponibilidad para ingresar el ${checkIn} y salir el ${checkOut} (Total: $${totalPrice} USD).`
    : `Hola Villa María, quisiera información y precios para reservar la casa de playa en Chichiriviche Calle 15.`;

  const waUrl = `https://wa.me/${PROPERTY_INFO.phoneWhatsApp.replace('+', '')}?text=${encodeURIComponent(
    waMessage
  )}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-[#1B3B36] text-[#F8F5F0] border-t border-[#F8F5F0]/15 shadow-2xl p-3 px-4 font-sans backdrop-blur-lg">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        {/* Price & Info */}
        <div className="flex flex-col">
          {hasDatesSelected ? (
            <>
              <span className="text-[10px] text-[#EAE3D8] font-bold uppercase tracking-wider">
                {nights} {nights === 1 ? 'noche' : 'noches'} seleccionadas
              </span>
              <span className="text-lg font-serif font-bold text-white leading-tight">
                ${totalPrice} <span className="text-xs font-sans font-normal text-[#EAE3D8]">USD</span>
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] text-[#EAE3D8] uppercase tracking-widest font-semibold">
                Chichiriviche C15
              </span>
              <span className="text-base font-serif font-bold text-white leading-tight">
                $120 <span className="text-xs font-sans font-normal text-[#EAE3D8]">/ noche</span>
              </span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] transition-all shadow-sm flex items-center justify-center shrink-0"
            title="Chat WhatsApp Directo"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
          </a>

          {hasDatesSelected ? (
            <button
              onClick={onOpenBooking}
              className="bg-[#C17D5C] hover:bg-[#a86a4c] text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Reservar</span>
            </button>
          ) : (
            <button
              onClick={onScrollToCalendar}
              className="bg-[#F8F5F0] text-[#1B3B36] hover:bg-[#EAE3D8] font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Calendar className="w-4 h-4 text-[#C17D5C]" />
              <span>Ver Fechas</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
