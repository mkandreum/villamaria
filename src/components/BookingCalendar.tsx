import React, { useState } from 'react';
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

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const prevMonth = () => {
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

  return (
    <section id="disponibilidad" className="py-10 sm:py-16 bg-[#F8F5F0] text-[#1B3B36] relative border-b border-[#1B3B36]/10 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Main Card Container */}
        <div className="bg-white border border-[#1B3B36]/15 rounded-3xl p-5 sm:p-8 shadow-xl space-y-6">
          
          {/* Header */}
          <div className="text-center border-b border-[#1B3B36]/10 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/10 border border-emerald-800/20 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Reserva Tu Estancia 🏡</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#1B3B36]">
              Calendario de Disponibilidad
            </h2>
            <p className="text-xs text-[#1B3B36]/70 mt-1">
              Selecciona tus huéspedes y las fechas de llegada y salida.
            </p>
          </div>

          {/* STEP 1: SELECT GUESTS */}
          <div className="bg-[#EAE3D8]/50 border border-[#1B3B36]/10 rounded-2xl p-4 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1B3B36] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-800" />
              <span>1. Número de Huéspedes</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-[#1B3B36]/70 block font-semibold mb-1">Adultos</span>
                <select
                  value={adults}
                  onChange={(e) => onAdultsChange(Number(e.target.value))}
                  className="w-full bg-white border border-[#1B3B36]/20 rounded-xl p-2.5 text-xs text-[#1B3B36] font-bold focus:outline-none"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} adultos
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className="text-[10px] text-[#1B3B36]/70 block font-semibold mb-1">Niños</span>
                <select
                  value={childrenCount}
                  onChange={(e) => onChildrenChange(Number(e.target.value))}
                  className="w-full bg-white border border-[#1B3B36]/20 rounded-xl p-2.5 text-xs text-[#1B3B36] font-bold focus:outline-none"
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1B3B36] flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-emerald-800" />
                <span>2. Elige Fechas en el Calendario</span>
              </label>

              {/* Month Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-full bg-[#F8F5F0] hover:bg-[#1B3B36] hover:text-white transition-colors border border-[#1B3B36]/10 text-[#1B3B36]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-serif font-bold text-[#1B3B36] min-w-[110px] text-center">
                  {monthNames[month]} {year}
                </span>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-full bg-[#F8F5F0] hover:bg-[#1B3B36] hover:text-white transition-colors border border-[#1B3B36]/10 text-[#1B3B36]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-[#1B3B36]/60 uppercase tracking-wider py-1 border-b border-[#1B3B36]/10">
              {daysOfWeek.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {daysGrid.map((dateStr, idx) => {
                if (!dateStr) return <div key={`empty-${idx}`} className="h-9 sm:h-11" />;

                const dayNum = parseInt(dateStr.split('-')[2], 10);
                const isBooked = isDateBooked(dateStr, bookings);
                const isSelectedStart = dateStr === checkIn;
                const isSelectedEnd = dateStr === checkOut;
                const isInSelectedRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

                let btnClass = 'h-9 sm:h-11 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ';
                if (isBooked) {
                  btnClass += 'bg-red-50 text-red-300 cursor-not-allowed line-through ';
                } else if (isSelectedStart || isSelectedEnd) {
                  btnClass += 'bg-[#1B3B36] text-white font-black shadow-md scale-105 ';
                } else if (isInSelectedRange) {
                  btnClass += 'bg-emerald-100 text-emerald-950 font-bold ';
                } else {
                  btnClass += 'bg-[#F8F5F0] hover:bg-emerald-50 text-[#1B3B36] border border-[#1B3B36]/10 ';
                }

                return (
                  <button
                    key={dateStr}
                    disabled={isBooked}
                    onClick={() => handleDayClick(dateStr)}
                    className={btnClass}
                  >
                    <span>{dayNum}</span>
                    {isSelectedStart ? (
                      <span className="text-[7px] text-emerald-300 font-bold uppercase leading-none">Llegada</span>
                    ) : isSelectedEnd ? (
                      <span className="text-[7px] text-emerald-300 font-bold uppercase leading-none">Salida</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: PRICE SUMMARY & RESERVATION CTA */}
          <div className="bg-[#F8F5F0] border border-[#1B3B36]/15 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#1B3B36]/70">Llegada:</span>
              <span className="font-bold text-[#1B3B36]">{checkIn ? formatDateSpanish(checkIn) : 'No seleccionada'}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-[#1B3B36]/10">
              <span className="text-[#1B3B36]/70">Salida:</span>
              <span className="font-bold text-[#1B3B36]">{checkOut ? formatDateSpanish(checkOut) : 'No seleccionada'}</span>
            </div>

            {priceBreakdown.nights > 0 && !isOccupiedError && (
              <div className="pt-3 border-t border-[#1B3B36]/15 space-y-2">
                <div className="flex justify-between text-xs text-[#1B3B36]/80">
                  <span>{priceBreakdown.nights} noche(s) x {pricing.baseNightlyRate}€</span>
                  <span>{priceBreakdown.baseNightsSubtotal}€</span>
                </div>
                <div className="flex justify-between text-xs text-[#1B3B36]/80">
                  <span>Gastos de limpieza</span>
                  <span>{priceBreakdown.cleaningFee}€</span>
                </div>
                <div className="flex justify-between items-center text-base font-serif font-bold text-[#1B3B36] pt-2 border-t border-[#1B3B36]/15">
                  <span>Total Estancia:</span>
                  <span className="text-xl text-[#1B3B36]">{priceBreakdown.totalPrice}€</span>
                </div>

                <button
                  onClick={onInitiateBooking}
                  className="w-full mt-2 py-3 rounded-2xl bg-[#1B3B36] text-white hover:bg-emerald-900 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Reservar Ahora 📅</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
