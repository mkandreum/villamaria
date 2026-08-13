import React, { useState } from 'react';
import { Booking, PricingConfig } from '../types';
import { formatDateSpanish, calculatePriceBreakdown } from '../utils/dateUtils';
import { X, CheckCircle2, CreditCard, DollarSign, Smartphone, Lock } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#F8F5F0] border border-[#1B3B36]/20 rounded-3xl max-w-lg w-full p-4 sm:p-7 shadow-2xl relative my-auto max-h-[92vh] flex flex-col font-sans overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#EAE3D8] text-[#1B3B36] hover:bg-[#1B3B36] hover:text-white transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-4 shrink-0 pr-8">
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-900/10 px-2.5 py-0.5 rounded-full border border-emerald-800/20 uppercase tracking-widest">
            Reserva Directa Villa María 🏡
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1B3B36] mt-1.5 leading-tight">
            Datos de Reserva
          </h2>
          <p className="text-xs text-[#1B3B36]/70 mt-0.5 font-sans">
            {breakdown.nights} {breakdown.nights === 1 ? 'noche' : 'noches'} ({formatDateSpanish(checkIn)} ➔ {formatDateSpanish(checkOut)})
          </p>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-none">
          {/* Personal Info */}
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#1B3B36]">
              1. Datos del Huésped Principal 👤
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-[#1B3B36]/70 block mb-0.5">
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-white border border-[#1B3B36]/20 rounded-xl p-2 text-xs text-[#1B3B36] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#1B3B36]/70 block mb-0.5">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+58 414 1234567"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full bg-white border border-[#1B3B36]/20 rounded-xl p-2 text-xs text-[#1B3B36] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#1B3B36]/70 block mb-0.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="juan@gmail.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full bg-white border border-[#1B3B36]/20 rounded-xl p-2 text-xs text-[#1B3B36] focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2 pt-2 border-t border-[#1B3B36]/10">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#1B3B36]">
              2. Método de Pago (Anticipo 50%) 💳
            </h3>
            <div className="grid grid-cols-2 gap-2">
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
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      paymentMethod === m.id
                        ? 'bg-[#1B3B36] text-white border-[#1B3B36] font-bold shadow-sm'
                        : 'bg-white border-[#1B3B36]/15 text-[#1B3B36]/80'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[11px] font-sans">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label className="text-[11px] font-semibold text-[#1B3B36]/70 block mb-0.5">
              Notas o Solicitudes Especiales
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Hora estimada de llegada 3:00 PM."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="w-full bg-white border border-[#1B3B36]/20 rounded-xl p-2 text-xs text-[#1B3B36] focus:outline-none"
            />
          </div>

          {/* Summary Box */}
          <div className="bg-[#EAE3D8] p-3 rounded-2xl border border-[#1B3B36]/15 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#1B3B36]/70 block font-semibold uppercase tracking-wider">Total Reserva:</span>
              <span className="text-lg font-serif font-bold text-[#1B3B36]">{breakdown.totalPrice}€</span>
            </div>
            <div className="text-right text-[11px] text-[#1B3B36]/80">
              <span>Anticipo 50%: </span>
              <strong className="text-emerald-800 font-bold">{Math.round(breakdown.totalPrice / 2)}€</strong>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full bg-[#1B3B36] hover:bg-emerald-900 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 min-h-[44px]"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Confirmar Reserva y Comprobante</span>
          </button>
        </form>
      </div>
    </div>
  );
};
