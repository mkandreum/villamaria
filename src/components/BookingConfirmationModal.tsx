import React from 'react';
import { Booking } from '../types';
import { PROPERTY_INFO } from '../data/mockData';
import { formatDateSpanish, calculateNights } from '../utils/dateUtils';
import { useCurrency } from '../context/CurrencyContext';
import {
  CheckCircle2,
  X,
  MapPin,
  MessageCircle,
  Copy,
  ExternalLink,
  QrCode
} from 'lucide-react';

interface BookingConfirmationModalProps {
  booking: Booking;
  onClose: () => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  booking,
  onClose,
}) => {
  const nights = calculateNights(booking.checkIn, booking.checkOut);
  const { formatPrice } = useCurrency();

  const waText = encodeURIComponent(
    `¡Hola Villa María! Acabo de solicitar una reserva:\n\n` +
      `📌 *Código:* ${booking.id}\n` +
      `👤 *Nombre:* ${booking.guestName}\n` +
      `📅 *Llegada:* ${formatDateSpanish(booking.checkIn)}\n` +
      `📅 *Salida:* ${formatDateSpanish(booking.checkOut)} (${nights} noches)\n` +
      `👥 *Huéspedes:* ${booking.adults} adultos, ${booking.children} niños\n` +
      `💵 *Monto Total:* ${formatPrice(booking.totalPrice)}\n\n` +
      `Agradezco me envíen las indicaciones para concretar el anticipo. ¡Gracias!`
  );

  const waUrl = `https://wa.me/${PROPERTY_INFO.phoneWhatsApp.replace('+', '')}?text=${waText}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(booking.id);
    alert('¡Código de reserva copiado!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#F8F5F0] border border-[#1B3B36]/20 rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] flex flex-col font-sans overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#EAE3D8] text-[#1B3B36] hover:bg-[#1B3B36] hover:text-white transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-none">
          {/* Top Voucher Banner */}
          <div className="text-center space-y-1.5 pt-2">
            <div className="w-12 h-12 bg-[#1B3B36] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#1B3B36]">
              ¡Reserva Solicitada con Éxito!
            </h2>
            <p className="text-xs text-[#1B3B36]/70 font-sans">
              Tus fechas han quedado reservadas en nuestro sistema.
            </p>
          </div>

          {/* Voucher Ticket Box */}
          <div className="bg-[#EAE3D8] border border-[#1B3B36]/15 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#1B3B36]/10">
              <div>
                <span className="text-[9px] text-[#1B3B36]/60 uppercase tracking-widest font-bold block">
                  Código de Reserva
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-mono font-bold text-[#1B3B36]">
                    {booking.id}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1 rounded bg-[#F8F5F0] hover:bg-[#1B3B36] hover:text-white text-[#1B3B36] transition-colors"
                    title="Copiar Código"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center border border-[#1B3B36]/10">
                <QrCode className="w-full h-full text-[#1B3B36]" />
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#1B3B36]/70">Huésped:</span>
                <span className="font-bold text-[#1B3B36]">{booking.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1B3B36]/70">Llegada:</span>
                <span className="font-medium text-[#1B3B36]">{formatDateSpanish(booking.checkIn)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1B3B36]/70">Salida:</span>
                <span className="font-medium text-[#1B3B36]">{formatDateSpanish(booking.checkOut)} ({nights} noches)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1B3B36]/70">Personas:</span>
                <span className="font-medium text-[#1B3B36]">{booking.adults} adultos, {booking.children} niños</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#1B3B36]/10">
                <span className="text-[#1B3B36] font-bold">Monto Total:</span>
                <span className="text-base font-serif font-bold text-[#1B3B36]">{formatPrice(booking.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Location Shortcut Link */}
          <div className="p-3 bg-white rounded-xl border border-[#1B3B36]/15 flex items-center justify-between text-xs font-sans">
            <div className="flex items-center gap-2 text-[#1B3B36]/80">
              <MapPin className="w-4 h-4 text-emerald-800" />
              <span className="text-[11px]">Chichiriviche Calle 15</span>
            </div>
            <a
              href={PROPERTY_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1B3B36] hover:text-emerald-800 underline flex items-center gap-1 font-semibold text-[11px]"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3 text-emerald-800" />
            </a>
          </div>

          {/* WhatsApp Direct Confirmation Button */}
          <div className="space-y-2 font-sans pt-1">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#1B3B36] hover:bg-emerald-900 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all min-h-[44px]"
            >
              <MessageCircle className="w-4.5 h-4.5 fill-white" />
              <span>Enviar Comprobante por WhatsApp</span>
            </a>

            <button
              onClick={onClose}
              className="w-full bg-[#EAE3D8] hover:bg-[#1B3B36]/10 text-[#1B3B36] py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Cerrar y Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
