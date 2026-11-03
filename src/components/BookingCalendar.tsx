import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle,
  Users,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Booking, PricingConfig } from '../types';
import {
  formatDateSpanish,
  formatISO,
  isDateBooked,
  isRangeOccupied,
  calculatePriceBreakdown
} from '../utils/dateUtils';
import { useCurrency } from '../context/CurrencyContext';
import { CurrencyToggle } from './CurrencyToggle';
import { AnimatedPrice } from './Motion';

interface BookingCalendarProps {
  checkIn: string;
  checkOut: string;
  adults: number;
  childrenCount: number;
  bookings: Booking[];
  pricing: PricingConfig;
  onCheckInChange: (dateStr: string) => void;
  onCheckOutChange: (dateStr: string) => void;
  onAdultsChange: (val: number) => void;
  onChildrenChange: (val: number) => void;
  onInitiateBooking: () => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  checkIn,
  checkOut,
  adults,
  childrenCount,
  bookings = [],
  pricing,
  onCheckInChange,
  onCheckOutChange,
  onAdultsChange,
  onChildrenChange,
  onInitiateBooking,
}) => {
  // Current view month (defaults to current month)
  const [currentViewDate, setCurrentViewDate] = useState<Date>(() => {
    if (checkIn) {
      const parts = checkIn.split('-').map(Number);
      return new Date(parts[0], parts[1] - 1, 1);
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const summaryRef = useRef<HTMLDivElement>(null);
  const todayStr = (() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  })();
  const step = !checkIn ? 1 : !checkOut ? 2 : 3;

  // After picking the checkout date, bring the price summary into view (mobile)
  useEffect(() => {
    if (checkIn && checkOut && window.matchMedia('(max-width: 767px)').matches) {
      const t = setTimeout(() => summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250);
      return () => clearTimeout(t);
    }
  }, [checkOut]);

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const isCurrentMonth = year === new Date().getFullYear() && month === new Date().getMonth();
  const prevMonth = () => {
    if (isCurrentMonth) return;
    setCurrentViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentViewDate(new Date(year, month + 1, 1));
  };

  // Build days grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysGrid: (string | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    daysGrid.push(dStr);
  }

  // Intuitive 2-click Date Selection Handler
  const handleDayClick = (dateStr: string) => {
    // If no checkIn selected OR both checkIn & checkOut already selected -> Start new range
    if (!checkIn || (checkIn && checkOut)) {
      onCheckInChange(dateStr);
      onCheckOutChange('');
      return;
    }

    // If checkIn is set, but no checkOut yet
    if (checkIn && !checkOut) {
      if (dateStr > checkIn) {
        // Valid end date
        onCheckOutChange(dateStr);
      } else {
        // Clicked earlier date, restart with new checkIn
        onCheckInChange(dateStr);
        onCheckOutChange('');
      }
    }
  };

  const priceBreakdown = calculatePriceBreakdown(checkIn, checkOut, adults, childrenCount, pricing);
  const isOccupiedError = checkIn && checkOut && isRangeOccupied(checkIn, checkOut, bookings);
  const { formatPrice } = useCurrency();

  return (
    <section className="py-14 sm:py-20 bg-[#F8F5F0] text-[#1B3B36] relative border-b border-[#1B3B36]/10 font-sans">
      <div className="max-w-4xl mx-auto px-3 sm:px-6">
        
        {/* Main Card Container */}
        <div className="bg-white border border-[#1B3B36]/15 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl space-y-5 sm:space-y-6">
          
          {/* Header */}
          <div className="text-center border-b border-[#1B3B36]/10 pb-4">
            <h2 className="text-[clamp(1.75rem,5vw,2.75rem)] leading-[1.05] font-serif font-bold text-[#1B3B36] tracking-tight text-balance">
              Reserva tu estancia
            </h2>
            <p className="text-xs text-[#1B3B36]/70 mt-1 max-w-md mx-auto">
              Selecciona tus huéspedes y las fechas de llegada y salida.
            </p>
            <ol className="flex items-center justify-center gap-2 mt-4 text-[11px] font-bold" aria-label="Progreso de reserva">
              {['Huéspedes', 'Llegada', 'Salida'].map((label, i) => {
                const done = i === 0 ? true : i === 1 ? Boolean(checkIn) : Boolean(checkOut);
                const current = (i === 0 && false) || (i === 1 && step === 1) || (i === 2 && step === 2);
                return (
                  <li key={label} className="flex items-center gap-2">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors ${
                      done && !current ? 'bg-emerald-900 text-white border-emerald-900' : current ? 'bg-emerald-100 text-emerald-950 border-emerald-500' : 'text-[#1B3B36]/60 border-[#1B3B36]/20'
                    }`}>
                      {done && !current ? <CheckCircle2 className="w-3 h-3" /> : <span className="tabular-nums">{i + 1}</span>}
                      {label}
                    </span>
                    {i < 2 && <span className="w-3 h-px bg-[#1B3B36]/25" />}
                  </li>
                );
              })}
            </ol>
          </div>

          {/* STEP 1: SELECT GUESTS */}
          <div className="bg-[#EAE3D8]/50 border border-[#1B3B36]/10 rounded-2xl p-3.5 sm:p-4 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1B3B36] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-800" />
              <span>1. Número de Huéspedes</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <span className="text-[11px] text-[#1B3B36]/70 block font-semibold mb-1">Adultos</span>
                <select
                  value={adults}
                  onChange={(e) => onAdultsChange(Number(e.target.value))}
                  className="w-full bg-white border border-[#1B3B36]/20 rounded-xl p-2.5 text-xs text-[#1B3B36] font-bold focus:outline-none min-h-[44px]"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} adultos
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className="text-[11px] text-[#1B3B36]/70 block font-semibold mb-1">Niños</span>
                <select
                  value={childrenCount}
                  onChange={(e) => onChildrenChange(Number(e.target.value))}
                  className="w-full bg-white border border-[#1B3B36]/20 rounded-xl p-2.5 text-xs text-[#1B3B36] font-bold focus:outline-none min-h-[44px]"
                >
                  {[...Array(8)].map((_, i) => (
                    <option key={i} value={i}>
                      {i} niños
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* STEP 2: CALENDAR DATE PICKER */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1B3B36] flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-emerald-800" />
                <span>2. Elige Fechas en el Calendario</span>
              </label>

              {/* Month Navigation */}
              <div className="flex items-center justify-between sm:justify-end gap-2">
                <button
                  onClick={prevMonth}
                  aria-label="Mes anterior"
                  className="p-2 sm:p-1.5 rounded-full bg-[#F8F5F0] hover:bg-[#1B3B36] hover:text-white transition-colors border border-[#1B3B36]/10 text-[#1B3B36] min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-serif font-bold text-[#1B3B36] min-w-[120px] text-center">
                  {monthNames[month]} {year}
                </span>
                <button
                  onClick={nextMonth}
                  aria-label="Mes siguiente"
                  className="p-2 sm:p-1.5 rounded-full bg-[#F8F5F0] hover:bg-[#1B3B36] hover:text-white transition-colors border border-[#1B3B36]/10 text-[#1B3B36] min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 text-center text-[11px] font-bold text-[#1B3B36]/60 uppercase tracking-wider py-1 border-b border-[#1B3B36]/10">
              {daysOfWeek.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <p className="text-xs font-semibold text-emerald-900 text-center mb-2" aria-live="polite">
              {step === 1 ? 'Toca tu fecha de llegada' : step === 2 ? 'Ahora toca tu fecha de salida' : 'Fechas elegidas. Toca otra para cambiar.'}
            </p>
            {/* Days Grid */}
            <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${year}-${month}`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
              className="grid grid-cols-7 gap-1 sm:gap-1.5"
            >
              {daysGrid.map((dateStr, idx) => {
                if (!dateStr) return <div key={`empty-${idx}`} className="h-10 sm:h-11" />;

                const dayNum = parseInt(dateStr.split('-')[2], 10);
                const isPast = dateStr < todayStr;
                const isToday = dateStr === todayStr;
                const isBooked = isPast || isDateBooked(dateStr, bookings);
                const isSelectedStart = dateStr === checkIn;
                const isSelectedEnd = dateStr === checkOut;
                const isInSelectedRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

                let btnClass = 'h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-bold transition flex flex-col items-center justify-center cursor-pointer min-h-[40px] ';
                if (isBooked) {
                  btnClass += isPast ? 'bg-transparent text-[#1B3B36]/25 cursor-not-allowed ' : 'bg-red-50 text-red-300 cursor-not-allowed line-through ';
                } else if (isSelectedStart || isSelectedEnd) {
                  btnClass += 'bg-[#1B3B36] text-white font-black shadow-md scale-105 ';
                } else if (isInSelectedRange) {
                  btnClass += 'bg-emerald-100 text-emerald-950 font-bold ';
                } else {
                  btnClass += `bg-[#F8F5F0] hover:bg-emerald-50 text-[#1B3B36] border active:scale-95 ${isToday ? 'border-emerald-600 ring-1 ring-emerald-600/40' : 'border-[#1B3B36]/10'} `;
                }

                return (
                  <button
                    key={dateStr}
                    disabled={isBooked}
                    onClick={() => handleDayClick(dateStr)}
                    aria-label={`${dayNum} de ${monthNames[month]}${isSelectedStart ? ', llegada' : isSelectedEnd ? ', salida' : ''}${isBooked && !isPast ? ', ocupado' : ''}`}
                    aria-pressed={isSelectedStart || isSelectedEnd}
                    className={btnClass}
                  >
                    <span>{dayNum}</span>
                    {isSelectedStart ? (
                      <span className="text-[11px] text-emerald-300 font-bold uppercase leading-none">Entra</span>
                    ) : isSelectedEnd ? (
                      <span className="text-[11px] text-emerald-300 font-bold uppercase leading-none">Sale</span>
                    ) : null}
                  </button>
                );
              })}
            </motion.div>
            </AnimatePresence>
          </div>

            {/* STEP 3: PRICE SUMMARY & RESERVATION CTA */}
          <div ref={summaryRef} className="bg-[#F8F5F0] border border-[#1B3B36]/15 rounded-2xl p-3.5 sm:p-5 space-y-3 scroll-mt-24">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#1B3B36]/70">Llegada:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#1B3B36]">{checkIn ? formatDateSpanish(checkIn) : 'No seleccionada'}</span>
                {(checkIn || checkOut) && (
                  <button
                    onClick={() => {
                      onCheckInChange('');
                      onCheckOutChange('');
                    }}
                    className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold underline py-1 px-1 cursor-pointer"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-[#1B3B36]/10">
              <span className="text-[#1B3B36]/70">Salida:</span>
              <span className="font-bold text-[#1B3B36]">{checkOut ? formatDateSpanish(checkOut) : 'No seleccionada'}</span>
            </div>

            {isOccupiedError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Algunas de las fechas seleccionadas ya están ocupadas o bloqueadas. Por favor elige otro rango.</span>
              </div>
            )}

            <AnimatePresence initial={false}>
            {priceBreakdown.nights > 0 && !isOccupiedError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden pt-3 border-t border-[#1B3B36]/15 space-y-2.5">
                <div className="flex justify-between text-xs text-[#1B3B36]/80">
                  <span>{priceBreakdown.nights} noche(s) x {formatPrice(pricing.baseNightlyRate)}</span>
                  <span>{formatPrice(priceBreakdown.baseNightsSubtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#1B3B36]/80">
                  <span>Gastos de limpieza</span>
                  <span>{formatPrice(priceBreakdown.cleaningFee)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-base font-serif font-bold text-[#1B3B36] pt-2 border-t border-[#1B3B36]/15 gap-1.5">
                  <span className="flex items-center gap-2">
                    Total Estancia:
                    <CurrencyToggle />
                  </span>
                  <span className="text-xl sm:text-2xl text-[#1B3B36]"><AnimatedPrice value={priceBreakdown.totalPrice} /></span>
                </div>

                <button
                  onClick={onInitiateBooking}
                  className="shine w-full mt-2 py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#1B3B36] to-emerald-900 text-white hover:from-emerald-900 hover:to-teal-900 font-bold text-xs uppercase tracking-wider transition shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Reservar Ahora</span>
                </button>

                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-[#1B3B36]/60 pt-2">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Reserva Directa Segura
                  </span>
                  <span>•</span>
                  <span> Confirmación Inmediata</span>
                  <span>•</span>
                  <span> Falcón, Chichiriviche</span>
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};
