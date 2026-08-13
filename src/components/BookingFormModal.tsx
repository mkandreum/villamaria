import React, { useState } from 'react';
import { Booking, PricingConfig } from '../types';
import { formatDateSpanish, calculatePriceBreakdown } from '../utils/dateUtils';
import { X, CheckCircle2, CreditCard, DollarSign, Smartphone, MessageSquare, ShieldCheck, Lock } from 'lucide-react';

interface BookingFormModalProps {
  checkIn: string;
  checkOut: string;
  adults: number;
  childrenCount: number;
  pricing: PricingConfig;
  onClose: () => void;
  onSubmitBooking: (booking: Booking) => void;
}

export const BookingFormModal: React.FC<BookingFormModalProps> = ({
  checkIn,
  checkOut,
  adults,
  childrenCount,
  pricing,
  onClose,
  onSubmitBooking,
}) => {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'zelle' | 'pago_movil' | 'efectivo' | 'transferencia'>('zelle');
  const [specialRequests, setSpecialRequests] = useState('');

  const breakdown = calculatePriceBreakdown(checkIn, checkOut, adults, childrenCount, pricing);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone || !checkIn || !checkOut) return;

    const newBooking: Booking = {
      id: `VM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      adults,
      children: childrenCount,
      totalPrice: breakdown.totalPrice,
      status: 'confirmed',
      createdAt: new Date().toISOString().split('T')[0],
      specialRequests,
      paymentMethod,
    };

    onSubmitBooking(newBooking);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1B3B36]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F8F5F0] border border-[#1B3B36]/20 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 font-sans">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#EAE3D8] text-[#1B3B36] hover:bg-[#C17D5C] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="text-xs font-bold text-[#C17D5C] bg-[#C17D5C]/15 px-3 py-1 rounded-full border border-[#C17D5C]/30 uppercase tracking-widest">
            Reserva Directa Villa María
          </span>
          <h2 className="text-2xl font-serif text-[#1B3B36] mt-3">
            Completa tus Datos de Reserva
          </h2>
          <p className="text-xs text-[#1B3B36]/70 mt-1 font-sans">
            Chichiriviche Calle 15 • {breakdown.nights} {breakdown.nights === 1 ? 'noche' : 'noches'} ({formatDateSpanish(checkIn)} al {formatDateSpanish(checkOut)})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#1B3B36]">
              1. Datos del Huésped Principal
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#1B3B36]/70 block mb-1">
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-white border border-[#1B3B36]/15 rounded-xl p-2.5 text-xs text-[#1B3B36] focus:outline-none focus:border-[#C17D5C]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1B3B36]/70 block mb-1">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+58 414 1234567"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full bg-white border border-[#1B3B36]/15 rounded-xl p-2.5 text-xs text-[#1B3B36] focus:outline-none focus:border-[#C17D5C]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1B3B36]/70 block mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="juan@gmail.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full bg-white border border-[#1B3B36]/15 rounded-xl p-2.5 text-xs text-[#1B3B36] focus:outline-none focus:border-[#C17D5C]"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2 pt-2 border-t border-[#1B3B36]/10">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#1B3B36]">
              2. Método de Pago Preferido (Anticipo 50%)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'zelle', label: 'Zelle (USD)', icon: DollarSign },
                { id: 'pago_movil', label: 'Pago Móvil (Bs)', icon: Smartphone },
                { id: 'efectivo', label: 'Efectivo (USD)', icon: CreditCard },
                { id: 'transferencia', label: 'Transferencia', icon: Lock },
              ].map((m) => {
                const IconComp = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3 rounded-2xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === m.id
                        ? 'bg-[#1B3B36] text-white border-[#1B3B36] font-bold shadow-sm'
                        : 'bg-white border-[#1B3B36]/15 text-[#1B3B36]/70 hover:border-[#C17D5C]'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                    <span className="text-[11px]">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label className="text-xs font-semibold text-[#1B3B36]/70 block mb-1">
              Notas adicionales o hora estimada de llegada
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Viajamos con 1 niño, hora llegada estimada 4:00 PM."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="w-full bg-white border border-[#1B3B36]/15 rounded-xl p-2.5 text-xs text-[#1B3B36] focus:outline-none focus:border-[#C17D5C]"
            />
          </div>

          {/* Summary Box */}
          <div className="bg-[#EAE3D8] p-4 rounded-2xl border border-[#1B3B36]/15 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#1B3B36]/70 block font-semibold uppercase tracking-wider">Total Reserva:</span>
              <span className="text-xl font-serif font-bold text-[#1B3B36]">${breakdown.totalPrice} USD</span>
            </div>
            <div className="text-right text-[11px] text-[#1B3B36]/80">
              <span>Anticipo 50%: </span>
              <strong className="text-[#C17D5C]">${Math.round(breakdown.totalPrice / 2)} USD</strong>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full bg-[#1B3B36] hover:bg-[#C17D5C] text-[#F8F5F0] font-bold py-4 px-4 rounded-xl text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-md transition-all transform active:scale-98"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmar Reserva y Generar Comprobante</span>
          </button>
        </form>
      </div>
    </div>
  );
};
