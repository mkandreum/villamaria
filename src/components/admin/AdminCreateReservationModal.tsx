import React, { useState } from 'react';
import { X, Calendar, User, Mail, Phone, Users, DollarSign, CheckCircle2, RefreshCw, FileText } from 'lucide-react';
import { api } from '../../api';

interface AdminCreateReservationModalProps {
  initialStartDate?: string;
  initialEndDate?: string;
  pricePerNight?: number;
  cleaningFee?: number;
  onClose: () => void;
  onSuccess: (newReservation: any) => void;
}

export const AdminCreateReservationModal: React.FC<AdminCreateReservationModalProps> = ({
  initialStartDate = '',
  initialEndDate = '',
  pricePerNight = 150,
  cleaningFee = 50,
  onClose,
  onSuccess,
}) => {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [startDate, setStartDate] = useState(initialStartDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(initialEndDate || '');
  const [guestsCount, setGuestsCount] = useState(2);
  const [status, setStatus] = useState<'CONFIRMED' | 'PENDING'>('CONFIRMED');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('Reserva manual creada desde el panel de administración');
  const [sendNotificationEmail, setSendNotificationEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate default auto-price
  const nights = React.useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    if (isNaN(s) || isNaN(e) || e <= s) return 0;
    return Math.ceil((e - s) / (1000 * 60 * 60 * 24));
  }, [startDate, endDate]);

  const autoPrice = nights > 0 ? nights * pricePerNight + cleaningFee : 0;
  const effectivePrice = customPrice !== '' && !isNaN(Number(customPrice)) ? Number(customPrice) : autoPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setError('Por favor indica el nombre del huésped.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Selecciona las fechas de llegada y salida.');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError('La fecha de salida debe ser posterior a la fecha de entrada.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.createAdminReservation({
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim() || undefined,
        guestPhone: guestPhone.trim() || undefined,
        startDate,
        endDate,
        guestsCount,
        totalPrice: effectivePrice,
        status,
        notes: notes.trim() || undefined,
        internalNotes: internalNotes.trim() || undefined,
        sendNotificationEmail,
      });

      if (res.reservation) {
        onSuccess(res.reservation);
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-emerald-950 border border-emerald-500/30 rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 md:p-7 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto text-emerald-100 font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800 hover:text-white transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 sm:mb-5 border-b border-emerald-500/20 pb-3 sm:pb-4 pr-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-emerald-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-white font-serif tracking-tight leading-snug truncate">
              Crear Nueva Reserva Manual
            </h3>
            <p className="text-[11px] sm:text-xs text-emerald-300/70 truncate">
              Registra una reserva directa o telefónica en el sistema
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-xs text-red-200">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 text-xs">
          {/* Guest Details */}
          <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-3.5 sm:p-4 space-y-3">
            <h4 className="font-bold text-emerald-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              Datos del Huésped
            </h4>

            <div>
              <label className="block text-emerald-300 font-semibold mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                placeholder="Ej. Carlos Mendoza"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full min-h-[44px] bg-emerald-950 border border-emerald-500/30 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400 placeholder-emerald-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-emerald-300 font-semibold mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="cliente@ejemplo.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full min-h-[44px] bg-emerald-950 border border-emerald-500/30 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400 placeholder-emerald-700"
                />
              </div>

              <div>
                <label className="block text-emerald-300 font-semibold mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="+58 414 1234567"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full min-h-[44px] bg-emerald-950 border border-emerald-500/30 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400 placeholder-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Dates and Occupancy */}
          <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-3.5 sm:p-4 space-y-3">
            <h4 className="font-bold text-emerald-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Fechas & Huéspedes
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-emerald-300 font-semibold mb-1">Fecha Llegada *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full min-h-[44px] bg-emerald-950 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-emerald-300 font-semibold mb-1">Fecha Salida *</label>
                <input
                  type="date"
                  required
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full min-h-[44px] bg-emerald-950 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-emerald-300 font-semibold mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  Nº Huéspedes
                </label>
                <select
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  className="w-full min-h-[44px] bg-emerald-950 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400"
                >
                  {[...Array(16)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} huésped{i > 0 ? 'es' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {nights > 0 && (
              <p className="text-[11px] text-emerald-400/80 font-medium">
                ⏱️ Duración: <strong>{nights} noche{nights > 1 ? 's' : ''}</strong>
              </p>
            )}
          </div>

          {/* Pricing and Status */}
          <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-3.5 sm:p-4 space-y-3">
            <h4 className="font-bold text-emerald-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Tarifa & Estado
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-emerald-300 font-semibold mb-1">Estado Inicial</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full min-h-[44px] bg-emerald-950 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400"
                >
                  <option value="CONFIRMED">Confirmada (Pago Acreditado) ✅</option>
                  <option value="PENDING">Pendiente (Por Pagar) 🟡</option>
                </select>
              </div>

              <div>
                <label className="block text-emerald-300 font-semibold mb-1">
                  Importe Total (USD $) {autoPrice > 0 ? `[Sugerido: $${autoPrice}]` : ''}
                </label>
                <input
                  type="number"
                  placeholder={autoPrice > 0 ? String(autoPrice) : '150'}
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full min-h-[44px] bg-emerald-950 border border-emerald-500/30 rounded-xl px-3.5 py-2.5 text-amber-300 font-bold text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Notes & Notification options */}
          <div className="space-y-2.5">
            <div>
              <label className="block text-emerald-300 font-semibold mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                Notas del Huésped / Requerimientos
              </label>
              <input
                type="text"
                placeholder="Ej. Llegada tarde 8 PM, solicita cuna..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full min-h-[44px] bg-emerald-900/40 border border-emerald-500/30 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400 placeholder-emerald-700"
              />
            </div>

            {guestEmail && guestEmail.includes('@') && (
              <label className="min-h-[44px] flex items-center gap-2.5 cursor-pointer pt-1 select-none">
                <input
                  type="checkbox"
                  checked={sendNotificationEmail}
                  onChange={(e) => setSendNotificationEmail(e.target.checked)}
                  className="w-4 h-4 rounded border-emerald-500 text-emerald-500 focus:ring-0 shrink-0"
                />
                <span className="text-[11px] sm:text-xs text-emerald-300 leading-snug">
                  Enviar correo de voucher/confirmación automáticamente al huésped ({guestEmail})
                </span>
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-emerald-500/20">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-900/40 hover:bg-emerald-800 text-emerald-300 font-bold transition-all flex items-center justify-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{loading ? 'Guardando...' : 'Crear Reserva'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
