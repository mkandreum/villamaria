import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Phone,
  Mail,
  DollarSign,
  Trash2,
  CalendarRange,
  MessageCircle,
  X,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../api';
import { AdminCreateReservationModal } from './AdminCreateReservationModal';

interface AdminCalendarViewProps {
  reservations: any[];
  blockedDates: any[];
  googleCalendarEvents?: any[];
  propertySettings: any;
  onRefresh: () => void;
  onShowAlert: (alert: { type: 'success' | 'error'; text: string }) => void;
}

export const AdminCalendarView: React.FC<AdminCalendarViewProps> = ({
  reservations,
  blockedDates,
  googleCalendarEvents = [],
  propertySettings,
  onRefresh,
  onShowAlert,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createInitialDate, setCreateInitialDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'BLOCKED'>('ALL');

  // Quick Reschedule state
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    newStartDate: '',
    newEndDate: '',
    additionalCost: false,
    additionalCostAmount: 0,
  });
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  // Quick Block Date Form State
  const [isQuickBlockOpen, setIsQuickBlockOpen] = useState(false);
  const [quickBlockData, setQuickBlockData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const daysOfWeekShort = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Build month calendar grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const daysGrid: (string | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    daysGrid.push(dStr);
  }

  // Filter items by status
  const filteredReservations = useMemo(() => {
    if (statusFilter === 'ALL') return reservations;
    if (statusFilter === 'BLOCKED') return [];
    return reservations.filter((r) => r.status === statusFilter);
  }, [reservations, statusFilter]);

  // Map each date to its events
  const dateEventsMap = useMemo(() => {
    const map: Record<string, { reservations: any[]; blocked: any[]; googleEvents: any[] }> = {};

    // Helper: format Date to YYYY-MM-DD
    const toYMD = (d: string | Date) => {
      const dateObj = typeof d === 'string' ? new Date(d) : d;
      return dateObj.toISOString().split('T')[0];
    };

    // Populate with reservations
    filteredReservations.forEach((res) => {
      try {
        const startStr = toYMD(res.startDate);
        const endStr = toYMD(res.endDate);
        const cur = new Date(startStr);
        const end = new Date(endStr);

        while (cur < end) {
          const key = cur.toISOString().split('T')[0];
          if (!map[key]) map[key] = { reservations: [], blocked: [], googleEvents: [] };
          map[key].reservations.push(res);
          cur.setDate(cur.getDate() + 1);
        }
      } catch (e) {
        // ignore date parse errors
      }
    });

    // Populate with blocked dates
    if (statusFilter === 'ALL' || statusFilter === 'BLOCKED') {
      blockedDates.forEach((b) => {
        try {
          const startStr = toYMD(b.startDate);
          const endStr = toYMD(b.endDate);
          const cur = new Date(startStr);
          const end = new Date(endStr);

          while (cur <= end) {
            const key = cur.toISOString().split('T')[0];
            if (!map[key]) map[key] = { reservations: [], blocked: [], googleEvents: [] };
            map[key].blocked.push(b);
            cur.setDate(cur.getDate() + 1);
          }
        } catch (e) {
          // ignore
        }
      });
    }

    // Populate with google calendar events
    if (statusFilter === 'ALL') {
      googleCalendarEvents.forEach((g) => {
        try {
          const startStr = toYMD(g.startDate);
          const endStr = toYMD(g.endDate);
          const cur = new Date(startStr);
          const end = new Date(endStr);

          while (cur < end) {
            const key = cur.toISOString().split('T')[0];
            if (!map[key]) map[key] = { reservations: [], blocked: [], googleEvents: [] };
            map[key].googleEvents.push(g);
            cur.setDate(cur.getDate() + 1);
          }
        } catch (e) {
          // ignore
        }
      });
    }

    return map;
  }, [filteredReservations, blockedDates, googleCalendarEvents, statusFilter]);

  // Monthly stats
  const monthStats = useMemo(() => {
    let confirmedCount = 0;
    let pendingCount = 0;
    let monthRevenue = 0;
    let occupiedDaysSet = new Set<string>();

    reservations.forEach((r) => {
      const s = new Date(r.startDate);
      const e = new Date(r.endDate);

      // check if intersects with current month
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);

      if (s <= monthEnd && e >= monthStart) {
        if (r.status === 'CONFIRMED') {
          confirmedCount++;
          monthRevenue += Number(r.totalPrice) || 0;
        } else if (r.status === 'PENDING') {
          pendingCount++;
        }

        // track occupied days in this month
        const cur = new Date(Math.max(s.getTime(), monthStart.getTime()));
        const endLoop = new Date(Math.min(e.getTime(), monthEnd.getTime()));
        while (cur < endLoop) {
          occupiedDaysSet.add(cur.toISOString().split('T')[0]);
          cur.setDate(cur.getDate() + 1);
        }
      }
    });

    const occupancyRate = daysInMonth > 0 ? Math.round((occupiedDaysSet.size / daysInMonth) * 100) : 0;

    return {
      confirmedCount,
      pendingCount,
      monthRevenue,
      occupancyRate,
      occupiedDays: occupiedDaysSet.size,
    };
  }, [reservations, year, month, daysInMonth]);

  // Actions on single reservation
  const handleConfirmPayment = async (resId: string, guestName: string) => {
    if (!window.confirm(`¿Confirmar el pago y activar la reserva de ${guestName}? Se enviará email de confirmación.`)) return;
    try {
      await api.confirmPayment(resId);
      onShowAlert({ type: 'success', text: `✅ Pago confirmado para ${guestName}. Correo enviado.` });
      onRefresh();
      setSelectedReservation(null);
    } catch (err: any) {
      onShowAlert({ type: 'error', text: err.message || 'Error al confirmar pago' });
    }
  };

  const handleUpdateStatus = async (resId: string, newStatus: string) => {
    try {
      await api.updateReservationStatus(resId, { status: newStatus });
      onShowAlert({ type: 'success', text: `Estado actualizado a ${newStatus}` });
      onRefresh();
      if (selectedReservation) {
        setSelectedReservation({ ...selectedReservation, status: newStatus });
      }
    } catch (err: any) {
      onShowAlert({ type: 'error', text: err.message || 'Error al cambiar estado' });
    }
  };

  const handleDeleteReservation = async (resId: string, guestName: string) => {
    if (!window.confirm(`¿Eliminar definitivamente la reserva de ${guestName}?`)) return;
    try {
      await api.deleteReservation(resId);
      onShowAlert({ type: 'success', text: `Reserva de ${guestName} eliminada.` });
      onRefresh();
      setSelectedReservation(null);
    } catch (err: any) {
      onShowAlert({ type: 'error', text: err.message || 'Error al eliminar reserva' });
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReservation) return;
    if (!rescheduleData.newStartDate || !rescheduleData.newEndDate) {
      onShowAlert({ type: 'error', text: 'Indica las nuevas fechas de llegada y salida.' });
      return;
    }
    if (new Date(rescheduleData.newEndDate) <= new Date(rescheduleData.newStartDate)) {
      onShowAlert({ type: 'error', text: 'La fecha de salida debe ser posterior a la de llegada.' });
      return;
    }

    setSubmittingReschedule(true);
    try {
      const res: any = await api.rescheduleReservation(selectedReservation.id, {
        newStartDate: rescheduleData.newStartDate,
        newEndDate: rescheduleData.newEndDate,
        additionalCost: rescheduleData.additionalCost,
        additionalCostAmount: rescheduleData.additionalCostAmount,
      });

      onShowAlert({
        type: 'success',
        text: res.hasAdditionalCost
          ? `✅ Reserva reprogramada. Notificación de pago enviada a ${selectedReservation.guestName}.`
          : `✅ Reserva reprogramada y confirmada para ${selectedReservation.guestName}.`,
      });
      setIsRescheduling(false);
      setSelectedReservation(null);
      onRefresh();
    } catch (err: any) {
      onShowAlert({ type: 'error', text: err.message || 'Error al reprogramar' });
    } finally {
      setSubmittingReschedule(false);
    }
  };

  const handleQuickBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickBlockData.startDate || !quickBlockData.endDate) return;

    try {
      await api.addBlockedDate(quickBlockData);
      onShowAlert({ type: 'success', text: 'Fechas bloqueadas en el calendario.' });
      setIsQuickBlockOpen(false);
      setQuickBlockData({ startDate: '', endDate: '', reason: '' });
      onRefresh();
    } catch (err: any) {
      onShowAlert({ type: 'error', text: err.message || 'Error al bloquear fechas' });
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4 sm:space-y-5 text-emerald-100 font-sans max-w-full overflow-hidden">
      {/* Top Controls Bar & Monthly Summary */}
      <div className="bg-emerald-900/40 border border-emerald-500/20 rounded-2xl p-3.5 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
        {/* Month Navigator */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
          <button
            onClick={goToToday}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-800/60 hover:bg-emerald-700 text-xs font-bold text-emerald-200 border border-emerald-500/30 transition-all flex items-center justify-center active:scale-95 shrink-0"
          >
            Hoy
          </button>

          <div className="flex items-center gap-1 sm:gap-1.5 bg-emerald-950/80 border border-emerald-500/30 rounded-xl p-1">
            <button
              onClick={prevMonth}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-emerald-800/70 text-emerald-300 transition-colors active:scale-95"
              title="Mes Anterior"
              aria-label="Mes Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm sm:text-base md:text-xl font-serif font-bold text-white px-1 sm:px-2 min-w-[120px] sm:min-w-[140px] text-center truncate select-none">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-emerald-800/70 text-emerald-300 transition-colors active:scale-95"
              title="Mes Siguiente"
              aria-label="Mes Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Monthly Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-emerald-950/60 border border-emerald-500/20 rounded-xl px-2.5 py-2 sm:px-3">
            <span className="text-[10px] text-emerald-400/70 uppercase font-semibold block">Confirmadas</span>
            <span className="text-sm font-bold text-emerald-300">{monthStats.confirmedCount}</span>
          </div>

          <div className="bg-emerald-950/60 border border-amber-500/20 rounded-xl px-2.5 py-2 sm:px-3">
            <span className="text-[10px] text-amber-400/70 uppercase font-semibold block">Pendientes</span>
            <span className="text-sm font-bold text-amber-300">{monthStats.pendingCount}</span>
          </div>

          <div className="bg-emerald-950/60 border border-teal-500/20 rounded-xl px-2.5 py-2 sm:px-3">
            <span className="text-[10px] text-teal-400/70 uppercase font-semibold block">Ocupación</span>
            <span className="text-xs sm:text-sm font-bold text-teal-300">{monthStats.occupancyRate}% ({monthStats.occupiedDays}d)</span>
          </div>

          <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-xl px-2.5 py-2 sm:px-3">
            <span className="text-[10px] text-emerald-400/70 uppercase font-semibold block">Ingresos Mes</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-400 truncate block">${monthStats.monthRevenue.toLocaleString()}</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCreateInitialDate(selectedDate || todayStr);
              setIsCreateModalOpen(true);
            }}
            className="flex-1 sm:flex-none min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Nueva Reserva</span>
          </button>

          <button
            onClick={() => {
              setQuickBlockData({
                startDate: selectedDate || todayStr,
                endDate: selectedDate || todayStr,
                reason: 'Mantenimiento / Propietario',
              });
              setIsQuickBlockOpen(true);
            }}
            className="min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold text-xs transition-all active:scale-95 shrink-0"
            title="Bloquear fechas"
            aria-label="Bloquear fechas"
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span className="text-xs">Bloquear</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Color Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
          {[
            { id: 'ALL', label: 'Todo', shortLabel: 'Todo' },
            { id: 'CONFIRMED', label: '🟢 Confirmadas', shortLabel: '🟢 Conf.' },
            { id: 'PENDING', label: '🟡 Pendientes', shortLabel: '🟡 Pend.' },
            { id: 'CANCELLED', label: '🔴 Canceladas', shortLabel: '🔴 Canc.' },
            { id: 'BLOCKED', label: '🟣 Bloqueadas', shortLabel: '🟣 Bloq.' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`min-h-[44px] px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap text-xs flex items-center justify-center shrink-0 ${
                statusFilter === tab.id
                  ? 'bg-emerald-500 text-emerald-950 font-bold shadow'
                  : 'bg-emerald-900/30 text-emerald-300/80 hover:bg-emerald-800/50'
              }`}
            >
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-emerald-400/80">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500" /> Conf.
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400" /> Pend.
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-purple-400" /> Bloq.
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-sky-400" /> Google
          </span>
        </div>
      </div>

      {/* Main Calendar Grid (7 Days) */}
      <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl sm:rounded-3xl p-2 sm:p-4 md:p-5 shadow-inner overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 text-center text-[10px] sm:text-xs font-bold text-emerald-400/70 uppercase tracking-wider py-1.5 sm:py-2 border-b border-emerald-500/20 mb-1 sm:mb-2">
          {daysOfWeek.map((d, i) => (
            <div key={d}>
              <span className="sm:hidden">{daysOfWeekShort[i]}</span>
              <span className="hidden sm:inline">{d}</span>
            </div>
          ))}
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 md:gap-2">
          {daysGrid.map((dateStr, idx) => {
            if (!dateStr) {
              return <div key={`empty-${idx}`} className="min-h-[48px] sm:min-h-[105px] rounded-lg sm:rounded-2xl bg-emerald-950/20" />;
            }

            const dayNum = parseInt(dateStr.split('-')[2], 10);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const dayEvents = dateEventsMap[dateStr] || { reservations: [], blocked: [], googleEvents: [] };

            const totalItems =
              dayEvents.reservations.length + dayEvents.blocked.length + dayEvents.googleEvents.length;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`min-h-[48px] sm:min-h-[105px] rounded-lg sm:rounded-2xl p-1 sm:p-2 flex flex-col justify-between transition-all cursor-pointer border select-none ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-800/40 ring-2 ring-emerald-400/30 shadow-lg'
                    : isToday
                    ? 'border-emerald-500/50 bg-emerald-900/50 shadow-sm'
                    : 'border-emerald-500/15 bg-emerald-950/40 hover:bg-emerald-900/30 hover:border-emerald-500/30'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] sm:text-xs font-bold rounded-md sm:rounded-lg px-1 sm:px-1.5 py-0.5 ${
                      isToday
                        ? 'bg-emerald-500 text-emerald-950 font-black'
                        : isSelected
                        ? 'bg-emerald-400/30 text-white'
                        : 'text-emerald-300'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {totalItems > 0 && (
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold text-emerald-400/80 bg-emerald-900/80 px-1 rounded">
                      {totalItems}
                    </span>
                  )}
                </div>

                {/* Mobile View: Event Dots Indicator (Compact on screens < sm) */}
                <div className="flex sm:hidden items-center justify-center gap-1 my-0.5 min-h-[8px]">
                  {dayEvents.reservations.slice(0, 2).map((res) => (
                    <span
                      key={res.id}
                      className={`w-1.5 h-1.5 rounded-full ${
                        res.status === 'CONFIRMED'
                          ? 'bg-emerald-400'
                          : res.status === 'PENDING'
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                      }`}
                    />
                  ))}
                  {dayEvents.blocked.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  )}
                  {dayEvents.googleEvents.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  )}
                </div>

                {/* Desktop View: Day Events Detailed Pills (Visible on sm+) */}
                <div className="hidden sm:block space-y-1 my-1 overflow-hidden">
                  {/* Reservations */}
                  {dayEvents.reservations.slice(0, 2).map((res) => {
                    const isConfirmed = res.status === 'CONFIRMED';
                    const isPending = res.status === 'PENDING';
                    return (
                      <div
                        key={res.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReservation(res);
                        }}
                        className={`text-[10px] px-1.5 py-0.5 rounded-md truncate font-semibold transition-transform hover:scale-[1.02] active:scale-95 flex items-center gap-1 ${
                          isConfirmed
                            ? 'bg-emerald-500/25 border border-emerald-500/40 text-emerald-200'
                            : isPending
                            ? 'bg-amber-500/25 border border-amber-500/40 text-amber-200'
                            : 'bg-red-500/20 border border-red-500/30 text-red-300 line-through'
                        }`}
                        title={`${res.guestName} (${res.status}) - US$ ${res.totalPrice}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isConfirmed ? 'bg-emerald-400' : isPending ? 'bg-amber-400' : 'bg-red-400'
                          }`}
                        />
                        <span className="truncate">{res.guestName}</span>
                      </div>
                    );
                  })}

                  {/* Blocked Dates */}
                  {dayEvents.blocked.slice(0, 1).map((b) => (
                    <div
                      key={b.id}
                      className="text-[10px] px-1.5 py-0.5 rounded-md truncate font-semibold bg-purple-500/20 border border-purple-500/30 text-purple-200 flex items-center gap-1"
                      title={`Bloqueado: ${b.reason || 'Sin motivo'}`}
                    >
                      <Lock className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                      <span className="truncate">{b.reason || 'Bloqueado'}</span>
                    </div>
                  ))}

                  {/* Google Calendar */}
                  {dayEvents.googleEvents.slice(0, 1).map((g, i) => (
                    <div
                      key={`g-${i}`}
                      className="text-[10px] px-1.5 py-0.5 rounded-md truncate font-semibold bg-sky-500/20 border border-sky-500/30 text-sky-200 flex items-center gap-1"
                      title={g.summary || 'Google Calendar'}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                      <span className="truncate">{g.summary || 'Google Cal'}</span>
                    </div>
                  ))}

                  {/* More counter if exceeded */}
                  {totalItems > 2 && (
                    <div className="text-[9px] text-emerald-400/70 text-right font-semibold">
                      +{totalItems - 2} más...
                    </div>
                  )}
                </div>

                {/* Bottom status hint */}
                <div className="h-1 rounded-full bg-emerald-500/10 overflow-hidden">
                  {dayEvents.reservations.some((r) => r.status === 'CONFIRMED') && (
                    <div className="h-full w-full bg-emerald-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Section / Drawer (when a day is clicked) */}
      {selectedDate && (
        <div className="bg-emerald-900/40 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-5 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
            <div className="flex items-start gap-2.5">
              <CalendarIcon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white font-serif leading-snug">
                  Actividades para el {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h4>
                <p className="text-[11px] text-emerald-300/70 mt-0.5">
                  {dateEventsMap[selectedDate]?.reservations.length || 0} reserva(s) • {dateEventsMap[selectedDate]?.blocked.length || 0} bloqueo(s)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => {
                  setCreateInitialDate(selectedDate);
                  setIsCreateModalOpen(true);
                }}
                className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 text-emerald-950 hover:bg-emerald-400 font-bold text-xs transition-all active:scale-95 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Reserva</span>
              </button>
              <button
                onClick={() => setSelectedDate(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 transition-colors"
                title="Cerrar detalles del día"
                aria-label="Cerrar detalles del día"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List of items on this day */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(!dateEventsMap[selectedDate] ||
              (dateEventsMap[selectedDate].reservations.length === 0 &&
                dateEventsMap[selectedDate].blocked.length === 0 &&
                dateEventsMap[selectedDate].googleEvents.length === 0)) && (
              <p className="col-span-full text-xs text-emerald-400/60 py-4 text-center">
                ✨ No hay reservas ni bloqueos para este día. Fecha disponible para huéspedes.
              </p>
            )}

            {dateEventsMap[selectedDate]?.reservations.map((res) => (
              <div
                key={res.id}
                onClick={() => setSelectedReservation(res)}
                className="p-3.5 sm:p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/25 hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between gap-2.5 group active:scale-[0.99] min-h-[44px]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mb-1 ${
                        res.status === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : res.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {res.status}
                    </span>
                    <h5 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors truncate">
                      {res.guestName}
                    </h5>
                    <p className="text-xs text-emerald-300/80 truncate">
                      {res.guestEmail || 'Sin email'} • {res.guestPhone || 'Sin tel'}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-emerald-400 block font-serif">
                      US$ {res.totalPrice}
                    </span>
                    <span className="text-[10px] text-emerald-400/60 font-mono">
                      {res.guestsCount} huésped(es)
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-500/10 flex items-center justify-between text-[11px] text-emerald-400/80">
                  <span>
                    {new Date(res.startDate).toLocaleDateString('es-ES')} ➔ {new Date(res.endDate).toLocaleDateString('es-ES')}
                  </span>
                  <span className="text-emerald-300 font-bold group-hover:underline flex items-center gap-1">
                    Ver ficha ➔
                  </span>
                </div>
              </div>
            ))}

            {dateEventsMap[selectedDate]?.blocked.map((b) => (
              <div
                key={b.id}
                className="p-3.5 sm:p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between gap-2 min-h-[44px]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Lock className="w-4 h-4 text-purple-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-purple-200 block truncate">Bloqueo de Calendario</span>
                    <span className="text-[11px] text-purple-300/70 truncate block">{b.reason || 'Sin motivo especificado'}</span>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (!window.confirm('¿Desbloquear este rango de fechas?')) return;
                    try {
                      await api.deleteBlockedDate(b.id);
                      onShowAlert({ type: 'success', text: 'Bloqueo eliminado.' });
                      onRefresh();
                    } catch (err: any) {
                      onShowAlert({ type: 'error', text: err.message });
                    }
                  }}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs shrink-0 transition-colors"
                  title="Eliminar bloqueo"
                  aria-label="Eliminar bloqueo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reservation Detail Modal / Drawer */}
      {selectedReservation && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-emerald-950 border border-emerald-500/30 rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 md:p-7 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto text-emerald-100 font-sans">
            {/* Close button */}
            <button
              onClick={() => {
                setSelectedReservation(null);
                setIsRescheduling(false);
              }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800 hover:text-white transition-colors"
              aria-label="Cerrar modal de reserva"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4 sm:mb-5 border-b border-emerald-500/20 pb-3.5 sm:pb-4 pr-10">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-emerald-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20 shrink-0">
                <CalendarRange className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white font-serif tracking-tight truncate">
                    Reserva: {selectedReservation.guestName}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      selectedReservation.status === 'CONFIRMED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : selectedReservation.status === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {selectedReservation.status}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-emerald-300/70 font-mono truncate">
                  ID: {selectedReservation.id}
                </p>
              </div>
            </div>

            {/* Reservation Details Grid */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-3.5 sm:p-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-400/70 block mb-0.5">Huésped Principal</span>
                  <p className="font-bold text-white text-sm">{selectedReservation.guestName}</p>
                  <p className="text-emerald-300/80 break-all">{selectedReservation.guestEmail || 'Sin email registrado'}</p>
                  <p className="text-emerald-300/80">{selectedReservation.guestPhone || 'Sin teléfono'}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-400/70 block mb-0.5">Estancia & Ocupación</span>
                  <p className="font-bold text-emerald-300 text-sm">
                    {new Date(selectedReservation.startDate).toLocaleDateString('es-ES')} ➔ {new Date(selectedReservation.endDate).toLocaleDateString('es-ES')}
                  </p>
                  <p className="text-emerald-300/80">{selectedReservation.guestsCount} huésped(es)</p>
                  <p className="text-emerald-200 font-bold font-serif text-sm mt-1">
                    Total: US$ {selectedReservation.totalPrice}
                  </p>
                </div>

                {selectedReservation.notes && (
                  <div className="col-span-full pt-2 border-t border-emerald-500/10">
                    <span className="text-[10px] font-bold uppercase text-emerald-400/70 block">Notas del Cliente:</span>
                    <p className="italic text-emerald-200/90">{selectedReservation.notes}</p>
                  </div>
                )}

                {selectedReservation.internalNotes && (
                  <div className="col-span-full pt-2 border-t border-emerald-500/10">
                    <span className="text-[10px] font-bold uppercase text-violet-300/70 block">Notas Internas Admin:</span>
                    <p className="italic text-violet-200/90">{selectedReservation.internalNotes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {/* Confirm Payment */}
                {selectedReservation.status !== 'CONFIRMED' && selectedReservation.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleConfirmPayment(selectedReservation.id, selectedReservation.guestName)}
                    className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs uppercase tracking-wide transition-all shadow active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Confirmar Pago</span>
                  </button>
                )}

                {/* Reschedule Button */}
                {selectedReservation.status !== 'CANCELLED' && (
                  <button
                    onClick={() => {
                      setIsRescheduling(!isRescheduling);
                      setRescheduleData({
                        newStartDate: selectedReservation.startDate ? new Date(selectedReservation.startDate).toISOString().split('T')[0] : '',
                        newEndDate: selectedReservation.endDate ? new Date(selectedReservation.endDate).toISOString().split('T')[0] : '',
                        additionalCost: false,
                        additionalCostAmount: 0,
                      });
                    }}
                    className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/40 font-bold text-xs uppercase tracking-wide transition-all active:scale-95"
                  >
                    <CalendarRange className="w-4 h-4 shrink-0" />
                    <span>Reprogramar</span>
                  </button>
                )}

                {/* WhatsApp button */}
                {selectedReservation.guestPhone && (
                  <a
                    href={`https://wa.me/${selectedReservation.guestPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `¡Hola ${selectedReservation.guestName}! Te contactamos de Villa María respecto a tu reserva (Código ${selectedReservation.id.slice(0, 8)}).`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 font-bold text-xs uppercase tracking-wide transition-all text-center"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span>WhatsApp</span>
                  </a>
                )}

                {/* Cancel Reservation */}
                {selectedReservation.status !== 'CANCELLED' && selectedReservation.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedReservation.id, 'CANCELLED')}
                    className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs uppercase tracking-wide transition-all active:scale-95"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Cancelar</span>
                  </button>
                )}

                {/* Delete Reservation */}
                <button
                  onClick={() => handleDeleteReservation(selectedReservation.id, selectedReservation.guestName)}
                  className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-bold text-xs uppercase tracking-wide transition-all active:scale-95"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  <span>Eliminar</span>
                </button>
              </div>

              {/* Reschedule Form inline */}
              {isRescheduling && (
                <form onSubmit={handleRescheduleSubmit} className="bg-violet-950/40 border border-violet-500/30 rounded-2xl p-3.5 sm:p-4 space-y-3 mt-3">
                  <h5 className="font-bold text-violet-300 uppercase tracking-wider text-[11px]">
                    📅 Nueva Selección de Fechas
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-violet-300/70 font-bold text-[10px] mb-1 uppercase">Nueva Llegada</label>
                      <input
                        type="date"
                        required
                        value={rescheduleData.newStartDate}
                        onChange={(e) => setRescheduleData({ ...rescheduleData, newStartDate: e.target.value })}
                        className="w-full min-h-[44px] bg-emerald-950 border border-violet-500/40 rounded-xl px-3 py-2 text-white text-sm sm:text-xs focus:outline-none focus:border-violet-400"
                      />
                    </div>

                    <div>
                      <label className="block text-violet-300/70 font-bold text-[10px] mb-1 uppercase">Nueva Salida</label>
                      <input
                        type="date"
                        required
                        min={rescheduleData.newStartDate}
                        value={rescheduleData.newEndDate}
                        onChange={(e) => setRescheduleData({ ...rescheduleData, newEndDate: e.target.value })}
                        className="w-full min-h-[44px] bg-emerald-950 border border-violet-500/40 rounded-xl px-3 py-2 text-white text-sm sm:text-xs focus:outline-none focus:border-violet-400"
                      />
                    </div>
                  </div>

                  <label className="min-h-[44px] flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rescheduleData.additionalCost}
                      onChange={(e) => setRescheduleData({ ...rescheduleData, additionalCost: e.target.checked })}
                      className="w-4 h-4 rounded border-violet-500 text-violet-500 focus:ring-0"
                    />
                    <span className="text-xs text-violet-200">Cobrar importe adicional por reprogramación</span>
                  </label>

                  {rescheduleData.additionalCost && (
                    <div>
                      <label className="block text-amber-300 font-bold text-[10px] mb-1 uppercase">Importe Adicional (US$)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Ej. 50"
                        value={rescheduleData.additionalCostAmount}
                        onChange={(e) => setRescheduleData({ ...rescheduleData, additionalCostAmount: parseFloat(e.target.value) || 0 })}
                        className="w-full min-h-[44px] bg-emerald-950 border border-amber-500/40 rounded-xl px-3 py-2 text-amber-200 text-sm sm:text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsRescheduling(false)}
                      className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 text-xs font-bold transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReschedule}
                      className="min-h-[44px] px-5 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-60 shadow"
                    >
                      {submittingReschedule ? 'Procesando...' : 'Confirmar Reprogramación'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Block Dates Modal */}
      {isQuickBlockOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-emerald-950 border border-purple-500/30 rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto text-emerald-100 font-sans">
            <button
              onClick={() => setIsQuickBlockOpen(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800 transition-colors"
              aria-label="Cerrar modal de bloqueo"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4 border-b border-purple-500/20 pb-3 pr-10">
              <Lock className="w-5 h-5 text-purple-400 shrink-0" />
              <h4 className="text-base sm:text-lg font-bold text-white font-serif">Bloquear Rango de Fechas</h4>
            </div>

            <form onSubmit={handleQuickBlockSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-300 font-semibold mb-1">Fecha Inicio *</label>
                  <input
                    type="date"
                    required
                    value={quickBlockData.startDate}
                    onChange={(e) => setQuickBlockData({ ...quickBlockData, startDate: e.target.value })}
                    className="w-full min-h-[44px] bg-emerald-950 border border-purple-500/30 rounded-xl px-3 py-2 text-white text-sm sm:text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-purple-300 font-semibold mb-1">Fecha Fin *</label>
                  <input
                    type="date"
                    required
                    min={quickBlockData.startDate}
                    value={quickBlockData.endDate}
                    onChange={(e) => setQuickBlockData({ ...quickBlockData, endDate: e.target.value })}
                    className="w-full min-h-[44px] bg-emerald-950 border border-purple-500/30 rounded-xl px-3 py-2 text-white text-sm sm:text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-300 font-semibold mb-1">Motivo del Bloqueo</label>
                <input
                  type="text"
                  placeholder="Ej. Mantenimiento general / Reservado por propietario"
                  value={quickBlockData.reason}
                  onChange={(e) => setQuickBlockData({ ...quickBlockData, reason: e.target.value })}
                  className="w-full min-h-[44px] bg-emerald-950 border border-purple-500/30 rounded-xl px-3 py-2 text-white text-sm sm:text-xs focus:outline-none placeholder-purple-800/80 focus:border-purple-400"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsQuickBlockOpen(false)}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-900/50 hover:bg-emerald-900 text-emerald-300 font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-purple-950 font-bold uppercase tracking-wider transition-all shadow active:scale-95"
                >
                  Guardar Bloqueo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Manual Reservation Create Modal */}
      {isCreateModalOpen && (
        <AdminCreateReservationModal
          initialStartDate={createInitialDate}
          initialEndDate=""
          pricePerNight={propertySettings?.price_per_night ? Number(propertySettings.price_per_night) : 150}
          cleaningFee={propertySettings?.cleaning_fee ? Number(propertySettings.cleaning_fee) : 50}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(newRes) => {
            setIsCreateModalOpen(false);
            onShowAlert({ type: 'success', text: `✅ Reserva creada con éxito para ${newRes.guestName}.` });
            onRefresh();
          }}
        />
      )}
    </div>
  );
};
