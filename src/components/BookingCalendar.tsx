import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle,
  Users,
  ShieldAlert,
  Sparkles,
  CreditCard,
  DollarSign
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
  bookings,
  pricing,
  onCheckInChange,
  onCheckOutChange,
  onAdultsChange,
  onChildrenChange,
  onInitiateBooking,
}) => {
  // Calendar View Month State
  const [currentViewDate, setCurrentViewDate] = useState<Date>(() => {
    if (checkIn) {
      const parts = checkIn.split('-').map(Number);
      return new Date(parts[0], parts[1] - 1, 1);
    }
    return new Date(2026, 7, 1); // Default to Aug 2026
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

  // Build calendar days array for the current view month
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

  // Selection handle
  const handleDayClick = (dateStr: string) => {
    const todayStr = formatISO(new Date());
    if (dateStr < todayStr) return; // cannot select past

    // If no checkIn or both checkIn & checkOut selected, restart range selection
    if (!checkIn || (checkIn && checkOut)) {
      if (isDateBooked(dateStr, bookings)) return; // cannot start on booked date
      onCheckInChange(dateStr);
      onCheckOutChange('');
    } else if (checkIn && !checkOut) {
      if (dateStr < checkIn) {
        // user clicked an earlier date, update checkIn
        if (isDateBooked(dateStr, bookings)) return;
        onCheckInChange(dateStr);
      } else if (dateStr === checkIn) {
        // single night stay checkIn -> checkOut next day
        const nextDay = new Date(dateStr);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = formatISO(nextDay);
        if (!isRangeOccupied(checkIn, nextDayStr, bookings)) {
          onCheckOutChange(nextDayStr);
        }
      } else {
        // check if range is free
        if (isRangeOccupied(checkIn, dateStr, bookings)) {
          // Range has booked dates inside! Show warning & select this date as new checkIn
          onCheckInChange(dateStr);
          onCheckOutChange('');
        } else {
          onCheckOutChange(dateStr);
        }
      }
    }
  };

  // Range checks
  const isOccupiedError = checkIn && checkOut && isRangeOccupied(checkIn, checkOut, bookings);
  const priceBreakdown = calculatePriceBreakdown(checkIn, checkOut, adults, childrenCount, pricing);

  return (
    <section id="disponibilidad" className="py-10 sm:py-20 bg-[#F8F5F0] text-[#1B3B36] relative border-b border-[#1B3B36]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C17D5C]/15 border border-[#C17D5C]/30 text-[#C17D5C] text-[10px] sm:text-xs font-sans uppercase tracking-[0.2em] font-bold mb-2">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendario de Disponibilidad</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif text-[#1B3B36] tracking-tight">
            Consulta Fechas y Tarifas
          </h2>
          <p className="text-[#1B3B36]/70 text-xs sm:text-sm mt-1 font-sans">
            Toca tu día de llegada y salida en el calendario para calcular el costo total.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Main Calendar View (8 Cols) */}
          <div className="lg:col-span-7 bg-[#EAE3D8] border border-[#1B3B36]/15 rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 shadow-sm">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 border-b border-[#1B3B36]/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-lg sm:text-xl font-serif italic text-[#1B3B36]">
                  {monthNames[month]} {year}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#1B3B36]/60 font-sans font-bold bg-[#F8F5F0] px-2 py-0.5 rounded-full border border-[#1B3B36]/10">
                  Villa María
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={prevMonth}
                  className="p-1.5 sm:p-2 rounded-full bg-[#F8F5F0] text-[#1B3B36] hover:bg-[#1B3B36] hover:text-[#F8F5F0] transition-colors border border-[#1B3B36]/10"
                  title="Mes Anterior"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 sm:p-2 rounded-full bg-[#F8F5F0] text-[#1B3B36] hover:bg-[#1B3B36] hover:text-[#F8F5F0] transition-colors border border-[#1B3B36]/10"
                  title="Mes Siguiente"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Calendar Legend */}
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-sans gap-2 mb-3 px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border border-[#1B3B36]/30 bg-[#F8F5F0]" />
                <span className="text-[#1B3B36]/80 uppercase tracking-wider">Libre</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#C17D5C]" />
                <span className="text-[#1B3B36]/80 uppercase tracking-wider">Elegido</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#C17D5C]/30 border border-[#1B3B36]/20" />
                <span className="text-[#1B3B36]/60 uppercase tracking-wider">Ocupado</span>
              </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 text-center font-sans text-[10px] sm:text-[11px] font-bold text-[#1B3B36]/50 uppercase tracking-wider mb-1">
              {daysOfWeek.map((day) => (
                <div key={day} className="py-1 sm:py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 font-sans">
              {daysGrid.map((dateStr, idx) => {
                if (!dateStr) {
                  return <div key={`empty-${idx}`} className="h-10 sm:h-14 rounded-xl" />;
                }

                const dayNum = parseInt(dateStr.split('-')[2], 10);
                const isBooked = isDateBooked(dateStr, bookings);
                const isSelectedStart = dateStr === checkIn;
                const isSelectedEnd = dateStr === checkOut;
                const isInSelectedRange =
                  checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;
                const isToday = dateStr === formatISO(new Date());

                let cellClasses =
                  'relative h-10 sm:h-14 rounded-full flex flex-col items-center justify-center text-xs font-semibold transition-all duration-200 cursor-pointer ';

                if (isBooked) {
                  cellClasses +=
                    'bg-[#C17D5C]/25 text-[#1B3B36]/40 cursor-not-allowed line-through border border-[#1B3B36]/10 ';
                } else if (isSelectedStart || isSelectedEnd) {
                  cellClasses +=
                    'bg-[#C17D5C] text-white font-bold shadow-md scale-105 z-10 ';
                } else if (isInSelectedRange) {
                  cellClasses +=
                    'bg-[#C17D5C]/30 text-[#1B3B36] font-bold ';
                } else {
                  cellClasses +=
                    'bg-[#F8F5F0] hover:bg-white text-[#1B3B36] border border-[#1B3B36]/15 hover:border-[#C17D5C] ';
                }

                return (
                  <button
                    key={dateStr}
                    disabled={isBooked}
                    onClick={() => handleDayClick(dateStr)}
                    className={cellClasses}
                    title={
                      isBooked
                        ? `Fecha no disponible (${dateStr})`
                        : `Seleccionar ${dateStr}`
                    }
                  >
                    <span>{dayNum}</span>
                    {isBooked ? (
                      <span className="text-[7px] sm:text-[8px] font-normal text-[#1B3B36]/40 leading-none">
                        Ocupado
                      </span>
                    ) : isSelectedStart ? (
                      <span className="text-[7px] sm:text-[8px] uppercase tracking-tighter font-bold text-white leading-none">
                        Llegada
                      </span>
                    ) : isSelectedEnd ? (
                      <span className="text-[7px] sm:text-[8px] uppercase tracking-tighter font-bold text-white leading-none">
                        Salida
                      </span>
                    ) : (
                      isToday && (
                        <span className="text-[7px] sm:text-[8px] font-medium text-[#C17D5C] leading-none">
                          Hoy
                        </span>
                      )
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Helper Note */}
            <div className="mt-4 sm:mt-6 pt-3 border-t border-[#1B3B36]/10 flex items-center gap-2 text-[11px] sm:text-xs font-sans text-[#1B3B36]/70">
              <Info className="w-3.5 h-3.5 text-[#C17D5C] shrink-0" />
              <span>
                <strong>Tip:</strong> Selecciona llegada y salida. El precio total se calcula automáticamente.
              </span>
            </div>
          </div>

          {/* Reservation Summary Sidebar (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white/80 backdrop-blur-md border border-[#1B3B36]/15 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-xl sm:text-2xl font-serif italic text-[#1B3B36] mb-3">
                Reserva tu estancia
              </h3>

              {/* Guest Counter Options */}
              <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-[#F8F5F0] rounded-xl sm:rounded-2xl border border-[#1B3B36]/10 font-sans">
                <div>
                  <label className="text-[10px] font-sans uppercase tracking-wider text-[#1B3B36]/70 font-semibold block mb-0.5">
                    Adultos
                  </label>
                  <select
                    value={adults}
                    onChange={(e) => onAdultsChange(Number(e.target.value))}
                    className="w-full bg-white border border-[#1B3B36]/15 text-[#1B3B36] text-xs rounded-lg p-1.5 focus:outline-none focus:border-[#C17D5C]"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} adultos
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-sans uppercase tracking-wider text-[#1B3B36]/70 font-semibold block mb-0.5">
                    Niños
                  </label>
                  <select
                    value={childrenCount}
                    onChange={(e) => onChildrenChange(Number(e.target.value))}
                    className="w-full bg-white border border-[#1B3B36]/15 text-[#1B3B36] text-xs rounded-lg p-1.5 focus:outline-none focus:border-[#C17D5C]"
                  >
                    {[...Array(8)].map((_, i) => (
                      <option key={i} value={i}>
                        {i} niños
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Dates Display Box */}
              <div className="bg-[#F8F5F0] p-3 rounded-xl sm:rounded-2xl border border-[#1B3B36]/10 space-y-1.5 mb-4 font-sans">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#1B3B36]/60 uppercase tracking-wider">Llegada:</span>
                  <span className="font-bold text-[#1B3B36]">
                    {checkIn ? formatDateSpanish(checkIn) : 'Elige fecha'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-[#1B3B36]/10">
                  <span className="text-[#1B3B36]/60 uppercase tracking-wider">Salida:</span>
                  <span className="font-bold text-[#1B3B36]">
                    {checkOut ? formatDateSpanish(checkOut) : 'Elige fecha'}
                  </span>
                </div>
                {priceBreakdown.nights > 0 && (
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-[#1B3B36]/10">
                    <span className="text-[#1B3B36]/60 uppercase tracking-wider">Duración:</span>
                    <span className="font-bold text-[#C17D5C] bg-[#C17D5C]/10 px-2 py-0.5 rounded-full border border-[#C17D5C]/20 text-[11px]">
                      {priceBreakdown.nights} {priceBreakdown.nights === 1 ? 'noche' : 'noches'}
                    </span>
                  </div>
                )}
              </div>

              {/* Occupied Error Banner if range picked includes booked dates */}
              {isOccupiedError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800 mb-3 font-sans">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Fechas Ocupadas</p>
                    <p className="text-[10px] text-rose-700">
                      Ese rango incluye días previamente reservados. Por favor elige otras fechas.
                    </p>
                  </div>
                </div>
              )}

              {/* Detailed Price Calculation Breakdown */}
              {priceBreakdown.nights > 0 && !isOccupiedError ? (
                <div className="space-y-2.5 pt-1 text-xs font-sans border-t border-[#1B3B36]/10">
                  <div className="flex justify-between text-[#1B3B36]/80">
                    <span>
                      Noches de semana ({priceBreakdown.weekdayNights}x ${pricing.baseNightlyRate})
                    </span>
                    <span>${priceBreakdown.weekdayNights * pricing.baseNightlyRate}</span>
                  </div>

                  {priceBreakdown.weekendNights > 0 && (
                    <div className="flex justify-between text-[#1B3B36]/80">
                      <span>
                        Noches fin semana ({priceBreakdown.weekendNights}x ${pricing.weekendRate})
                      </span>
                      <span>${priceBreakdown.weekendNights * pricing.weekendRate}</span>
                    </div>
                  )}

                  {priceBreakdown.extraGuests > 0 && (
                    <div className="flex justify-between text-[#1B3B36]/80">
                      <span>
                        Huéspedes adic. ({priceBreakdown.extraGuests}x ${pricing.extraGuestFee})
                      </span>
                      <span>${priceBreakdown.extraGuestsSubtotal}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#1B3B36]/80">
                    <span>Limpieza fija</span>
                    <span>${priceBreakdown.cleaningFee}</span>
                  </div>

                  {/* Total Final Highlight */}
                  <div className="pt-2 border-t border-[#1B3B36]/15 flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-bold text-[#1B3B36] block">Total:</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-serif font-bold text-[#1B3B36]">
                        ${priceBreakdown.totalPrice} USD
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onInitiateBooking}
                    className="w-full mt-3 bg-[#1B3B36] hover:bg-[#C17D5C] text-[#F8F5F0] py-3.5 rounded-xl font-sans text-xs uppercase tracking-wider font-bold shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Continuar Reserva</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-[#F8F5F0] rounded-xl border border-dashed border-[#1B3B36]/20 text-center text-xs font-sans text-[#1B3B36]/60 space-y-1">
                  <CalendarIcon className="w-5 h-5 text-[#C17D5C] mx-auto mb-1" />
                  <p className="font-bold text-[#1B3B36]">
                    Selecciona tus fechas arriba
                  </p>
                  <p className="text-[10px]">
                    Tarifa desde <strong>${pricing.baseNightlyRate} USD / noche</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Guarantees Badge */}
            <div className="bg-[#EAE3D8] border border-[#1B3B36]/15 rounded-xl sm:rounded-2xl p-3.5 space-y-1.5 text-xs font-sans text-[#1B3B36]/80">
              <div className="flex items-center gap-1.5 text-[#C17D5C] font-bold uppercase tracking-wider text-[10px]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Garantía Villa María:</span>
              </div>
              <ul className="space-y-1 text-[#1B3B36]/70 text-[10px] pl-4 list-disc">
                <li>Reserva confirmada con el 50% de anticipo.</li>
                <li>Atención inmediata por WhatsApp.</li>
                <li>Planta eléctrica y tanque de agua continuos.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
