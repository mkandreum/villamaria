import { useSite } from '../context/SiteContext';
import React, { useState, useEffect } from 'react';
import { Booking, PricingConfig } from '../types';
import { formatDateSpanish, calculatePriceBreakdown } from '../utils/dateUtils';
import { X, CheckCircle2, CreditCard, DollarSign, Smartphone, Lock, Info, MessageCircle } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { CurrencyToggle } from './CurrencyToggle';

interface BookingFormModalProps {
  checkIn: string;
  checkOut: string;
  adults: number;
  childrenCount: number;
  pricing: PricingConfig;
  paymentZelle?: boolean;
  paymentPagoMovil?: boolean;
  paymentEfectivo?: boolean;
  paymentTransferencia?: boolean;
  onClose: () => void;
  onSubmitBooking: (booking: Booking) => void | Promise<void>;
}

export const BookingFormModal: React.FC<BookingFormModalProps> = ({
  checkIn,
  checkOut,
  adults,
  childrenCount,
  pricing,
  paymentZelle = true,
  paymentPagoMovil = true,
  paymentEfectivo = true,
  paymentTransferencia = true,
  onClose,
  onSubmitBooking,
}) => {
  const { t, siteName } = useSite();
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const errors: Record<string, string> = {};
  if (guestName.trim().length < 3) errors.guestName = 'Escribe tu nombre y apellido.';
  if (guestPhone.replace(/\D/g, '').length < 7) errors.guestPhone = 'Indica un teléfono válido, con código de país.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) errors.guestEmail = 'Necesitamos un correo válido para enviarte la confirmación.';
  const showError = (k: string) => (touched[k] && errors[k] ? errors[k] : '');
  const fieldClass = (k: string) =>
    `w-full bg-white border rounded-xl p-2.5 text-sm text-[#1c1c1c] focus:outline-none focus:ring-2 min-h-[48px] transition ${
      showError(k) ? 'border-red-400 focus:ring-red-300' : 'border-[#1c1c1c]/20 focus:ring-emerald-300'
    }`;
  const ErrorText: React.FC<{ id: string; k: string }> = ({ id, k }) =>
    showError(k) ? <p id={id} role="alert" className="text-[11px] text-red-600 font-semibold mt-1">{showError(k)}</p> : null;
  
  const allMethods = [
    { id: 'zelle', label: 'Zelle (USD)', icon: DollarSign, enabled: paymentZelle },
    { id: 'pago_movil', label: 'Pago Móvil (Bs)', icon: Smartphone, enabled: paymentPagoMovil },
    { id: 'efectivo', label: 'Efectivo (USD)', icon: CreditCard, enabled: paymentEfectivo },
    { id: 'transferencia', label: 'Transferencia', icon: Lock, enabled: paymentTransferencia },
  ];

  const availableMethods = allMethods.filter((m) => m.enabled !== false && (m.enabled as any) !== 'false');
  const [paymentMethod, setPaymentMethod] = useState<string>(
    availableMethods.length > 0 ? availableMethods[0].id : 'coordinacion_whatsapp'
  );

  useEffect(() => {
    if (availableMethods.length > 0 && !availableMethods.some((m) => m.id === paymentMethod)) {
      setPaymentMethod(availableMethods[0].id);
    }
  }, [paymentZelle, paymentPagoMovil, paymentEfectivo, paymentTransferencia]);

  const breakdown = calculatePriceBreakdown(checkIn, checkOut, adults, childrenCount, pricing);
  const { formatPrice } = useCurrency();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (Object.keys(errors).length > 0 || !checkIn || !checkOut) {
      setTouched({ guestName: true, guestPhone: true, guestEmail: true });
      (document.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus();
      return;
    }

    const newBooking: Booking = {
      id: `VM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      adults,
      children: childrenCount,
      totalPrice: breakdown.totalPrice || 0,
      status: 'confirmed',
      createdAt: new Date().toISOString().split('T')[0],
      specialRequests,
      paymentMethod: paymentMethod as any,
    };

    setSubmitting(true);
    try {
      await onSubmitBooking(newBooking);
    } finally {
      setSubmitting(false);
    }
  };

  const [specialRequests, setSpecialRequests] = useState('');

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-start justify-center modal-backdrop p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#efeeea] border border-[#1c1c1c]/20 rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-7 shadow-2xl relative my-auto max-h-[92vh] flex flex-col font-sans overflow-hidden">
        {/* Close Button */}
        <button aria-label="Cerrar"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 rounded-full bg-[#e1dfd8] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-white transition z-10 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-3.5 sm:mb-4 shrink-0 pr-8">
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-900/10 px-2.5 py-0.5 rounded-full border border-emerald-800/20 uppercase tracking-widest inline-block">{t('txt_form_title')}</span>
          <h2 className="text-lg sm:text-2xl font-serif font-bold text-[#1c1c1c] mt-1 leading-tight">{t('txt_form_summary')}</h2>
          <p className="text-xs text-[#1c1c1c]/70 mt-0.5 font-sans">
            {breakdown.nights} {breakdown.nights === 1 ? 'noche' : 'noches'} ({formatDateSpanish(checkIn)}  {formatDateSpanish(checkOut)})
          </p>
        </div>

        {/* Scrollable Form Body */}
        <form noValidate onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-3.5 sm:space-y-4 pr-1 scrollbar-none">
          {/* Personal Info */}
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#1c1c1c]">{t('txt_form_s1')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-[#1c1c1c]/70 block mb-0.5">{t('txt_form_name')}</label>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Ej. Juan Pérez"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, guestName: true }))}
                  aria-invalid={Boolean(showError('guestName'))}
                  aria-describedby="err-name"
                  className={fieldClass('guestName')}
                />
                <ErrorText id="err-name" k="guestName" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#1c1c1c]/70 block mb-0.5">{t('txt_form_phone')}</label>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+58 414 1234567"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, guestPhone: true }))}
                  aria-invalid={Boolean(showError('guestPhone'))}
                  aria-describedby="err-phone"
                  className={fieldClass('guestPhone')}
                />
                <ErrorText id="err-phone" k="guestPhone" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#1c1c1c]/70 block mb-0.5">{t('txt_form_email')}</label>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                placeholder="juan@gmail.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, guestEmail: true }))}
                aria-invalid={Boolean(showError('guestEmail'))}
                aria-describedby="err-email"
                className={fieldClass('guestEmail')}
              />
              <ErrorText id="err-email" k="guestEmail" />
            </div>
          </div>

          {/* Payment Method Preferences */}
          <div className="space-y-2 pt-2 border-t border-[#1c1c1c]/10">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#1c1c1c]">{t('txt_form_s2')}</h3>
            
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-[#1c1c1c] flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>{t('txt_form_payinfo')}</span>
            </div>

            {availableMethods.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {availableMethods.map((m) => {
                  const IconComp = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition min-h-[44px] cursor-pointer ${
                        paymentMethod === m.id
                          ? 'bg-[#1c1c1c] text-white border-[#1c1c1c] font-bold shadow-sm'
                          : 'bg-white border-[#1c1c1c]/15 text-[#1c1c1c]/80 hover:bg-[#e1dfd8]'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs font-sans truncate">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 bg-white rounded-xl border border-[#1c1c1c]/15 text-xs text-[#1c1c1c] flex items-center gap-2 font-semibold">
                <MessageCircle className="w-4 h-4 text-emerald-800" />
                <span>{t('txt_form_sub')}</span>
              </div>
            )}
          </div>

          {/* Special Requests */}
          <div>
            <label className="text-[11px] font-semibold text-[#1c1c1c]/70 block mb-0.5">{t('txt_form_notes')}</label>
            <textarea
              rows={2}
              placeholder="Ej. Hora estimada de llegada 3:00 PM."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="w-full bg-white border border-[#1c1c1c]/20 rounded-xl p-2.5 text-xs text-[#1c1c1c] focus:outline-none resize-none"
            />
          </div>

          {/* Summary Box */}
          <div className="bg-[#e1dfd8] p-3 rounded-2xl border border-[#1c1c1c]/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#1c1c1c]/70 block font-semibold uppercase tracking-wider">{t('txt_form_total')}</span>
              <CurrencyToggle />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-base sm:text-lg font-serif font-bold text-[#1c1c1c] truncate">{formatPrice(breakdown.totalPrice)}</span>
              <div className="text-right text-[11px] text-[#1c1c1c]/80 shrink-0">
                <span>{t('txt_form_deposit')}</span>
                <strong className="text-emerald-800 font-bold">{formatPrice(Math.round(breakdown.totalPrice / 2))}</strong>
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={submitting}
            className="shine w-full disabled:opacity-60 disabled:cursor-wait bg-[#1c1c1c] hover:bg-emerald-900 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition active:scale-95 min-h-[48px] cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{submitting ? 'Enviando…' : t('txt_form_cta')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
