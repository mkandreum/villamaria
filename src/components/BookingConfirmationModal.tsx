import React from 'react';
import { Booking } from '../types';
import { PROPERTY_INFO } from '../data/mockData';
import { formatDateSpanish, calculateNights } from '../utils/dateUtils';
import {
  CheckCircle2,
  X,
  MapPin,
  Calendar,
  Users,
  MessageCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
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

  // Formatted WhatsApp message link
  const waText = encodeURIComponent(
    `¡Hola Villa María! Acabo de hacer una solicitud de reserva:\n\n` +
      `📌 *Código de Reserva:* ${booking.id}\n` +
      `👤 *Nombre:* ${booking.guestName}\n` +
      `📅 *Llegada:* ${formatDateSpanish(booking.checkIn)}\n` +
      `📅 *Salida:* ${formatDateSpanish(booking.checkOut)} (${nights} noches)\n` +
      `👥 *Huéspedes:* ${booking.adults} adultos, ${booking.children} niños\n` +
      `💵 *Monto Total:* $${booking.totalPrice} USD\n` +
      `💳 *Método de Pago:* ${booking.paymentMethod.toUpperCase()}\n\n` +
      `Agradezco me envíen las indicaciones para concretar el anticipo. ¡Gracias!`
  );

  const waUrl = `https://wa.me/${PROPERTY_INFO.phoneWhatsApp.replace('+', '')}?text=${waText}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(booking.id);
    alert('¡Código de reserva copiado al portapapeles!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1B3B36]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F8F5F0] border border-[#1B3B36]/20 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8 font-sans">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#EAE3D8] text-[#1B3B36] hover:bg-[#C17D5C] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Voucher Banner */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 bg-[#1B3B36] text-[#F8F5F0] rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8 text-[#C17D5C]" />
          </div>
          <h2 className="text-2xl font-serif text-[#1B3B36]">
            ¡Reserva Solicitada con Éxito!
          </h2>
          <p className="text-xs text-[#1B3B36]/70 font-sans">
            Tus fechas han quedado pre-reservadas en nuestro sistema.
          </p>
        </div>

        {/* Voucher Ticket Box */}
        <div className="bg-[#EAE3D8] border border-[#1B3B36]/15 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#1B3B36]/10">
            <div>
              <span className="text-[10px] text-[#1B3B36]/60 uppercase tracking-widest font-bold block">
                Código de Reserva
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono font-bold text-[#1B3B36]">
                  {booking.id}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 rounded bg-[#F8F5F0] hover:bg-[#C17D5C] hover:text-white text-[#1B3B36] transition-colors"
                  title="Copiar Código"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center border border-[#1B3B36]/10">
              <QrCode className="w-full h-full text-[#1B3B36]" />
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#1B3B36]/70">Huésped:</span>
              <span className="font-bold text-[#1B3B36]">{booking.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#1B3B36]/70">Ubicación:</span>
              <span className="text-[#C17D5C] font-semibold">{PROPERTY_INFO.shortLocation}</span>
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
              <span className="text-base font-serif font-bold text-[#C17D5C]">${booking.totalPrice} USD</span>
            </div>
          </div>
        </div>

        {/* Location Shortcut Link */}
        <div className="mt-4 p-3 bg-white rounded-xl border border-[#1B3B36]/15 flex items-center justify-between text-xs font-sans">
          <div className="flex items-center gap-2 text-[#1B3B36]/80">
            <MapPin className="w-4 h-4 text-[#C17D5C]" />
            <span>Chichiriviche Calle 15 (c15)</span>
          </div>
          <a
            href={PROPERTY_INFO.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1B3B36] hover:text-[#C17D5C] underline flex items-center gap-1 font-semibold text-[11px]"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* WhatsApp Direct Confirmation Button */}
        <div className="mt-6 space-y-2 font-sans">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#1B3B36] hover:bg-[#C17D5C] text-[#F8F5F0] font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <MessageCircle className="w-5 h-5 fill-[#F8F5F0]" />
            <span>Enviar Comprobante por WhatsApp</span>
          </a>

          <button
            onClick={onClose}
            className="w-full bg-[#EAE3D8] hover:bg-[#1B3B36]/10 text-[#1B3B36] py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Cerrar y Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};
