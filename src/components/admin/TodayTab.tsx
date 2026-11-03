import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, ArrowDownToLine, ArrowUpFromLine, CalendarPlus, Lock, MessageCircle, Users } from 'lucide-react';
import type { AdminCtx } from './types';
import { Btn, Card, SectionTitle, fmtDate, money, nightsBetween, todayYmd, ymd } from './ui';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const waLink = (phone: string, text: string) => `https://wa.me/${(phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

const GuestRow: React.FC<{ r: any; kind: 'in' | 'out' }> = ({ r, kind }) => (
  <div className="flex items-center gap-3 py-3">
    <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${kind === 'in' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-sky-400/15 text-sky-300'}`}>
      {kind === 'in' ? <ArrowDownToLine className="w-5 h-5" /> : <ArrowUpFromLine className="w-5 h-5" />}
    </span>
    <div className="min-w-0 flex-1">
      <p className="font-semibold text-white truncate">{r.guestName}</p>
      <p className="text-xs text-emerald-200/60 flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5" />
        {r.guestsCount} · {kind === 'in' ? `${nightsBetween(r.startDate, r.endDate)} noches` : `entró el ${fmtDate(r.startDate)}`}
        {r.status === 'PENDING' && <span className="text-amber-300 font-semibold">· sin pago</span>}
      </p>
    </div>
    {r.guestPhone && (
      <a
        href={waLink(r.guestPhone, `Hola ${r.guestName}, `)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`WhatsApp a ${r.guestName}`}
        className="w-11 h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center active:scale-90 transition-transform shrink-0"
      >
        <MessageCircle className="w-5 h-5" />
      </a>
    )}
  </div>
);

export const TodayTab: React.FC<{ ctx: AdminCtx }> = ({ ctx }) => {
  const { reservations, blockedDates } = ctx;
  const today = todayYmd();
  const [active, setActive] = useState<number | null>(null);

  const data = useMemo(() => {
    const live = reservations.filter((r) => r.status !== 'CANCELLED');
    const arrivals = live.filter((r) => ymd(r.startDate) === today);
    const departures = live.filter((r) => ymd(r.endDate) === today);
    const staying = live.find((r) => ymd(r.startDate) <= today && ymd(r.endDate) > today);
    const upcoming = live
      .filter((r) => ymd(r.startDate) > today)
      .sort((a, b) => ymd(a.startDate).localeCompare(ymd(b.startDate)))
      .slice(0, 4);
    const pending = reservations.filter((r) => r.status === 'PENDING');

    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return { y: d.getFullYear(), m: d.getMonth(), total: 0 };
    });
    live.forEach((r) => {
      if (r.status !== 'CONFIRMED' && r.status !== 'COMPLETED') return;
      const d = new Date(r.startDate);
      const slot = months.find((x) => x.y === d.getUTCFullYear() && x.m === d.getUTCMonth());
      if (slot) slot.total += Number(r.totalPrice) || 0;
    });

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const busy = new Set<string>();
    [...live.filter((r) => r.status !== 'PENDING' || true), ...blockedDates.map((b) => ({ ...b, __block: true }))].forEach((r: any) => {
      const cur = new Date(ymd(r.startDate));
      const end = new Date(ymd(r.endDate));
      while (cur < end || (r.__block && cur <= end)) {
        const key = cur.toISOString().slice(0, 10);
        if (key.startsWith(prefix)) busy.add(key);
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
    });
    return { arrivals, departures, staying, upcoming, pending, months, occupancy: Math.round((busy.size / daysInMonth) * 100), busyDays: busy.size, daysInMonth };
  }, [reservations, blockedDates, today]);

  const max = Math.max(...data.months.map((m) => m.total), 1);
  const monthTotal = data.months[5].total;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="space-y-6">
      <div className="px-1">
        <p className="text-sm text-emerald-200/60 capitalize">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h2 className="font-serif text-3xl font-bold text-white leading-tight">{greeting}</h2>
      </div>

      {data.pending.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => ctx.goTab('reservations', 'PENDING')}
          className="w-full flex items-center gap-3 rounded-2xl bg-amber-400/15 border border-amber-400/35 p-4 text-left active:scale-[0.98] transition-transform cursor-pointer"
        >
          <span className="w-11 h-11 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-amber-100">
              {data.pending.length} {data.pending.length === 1 ? 'reserva espera' : 'reservas esperan'} tu pago
            </span>
            <span className="block text-xs text-amber-200/70">Toca para revisarlas y confirmarlas</span>
          </span>
        </motion.button>
      )}

      <section>
        <SectionTitle title="Hoy en la villa" />
        <Card className="!py-1 divide-y divide-emerald-400/10">
          {data.arrivals.length === 0 && data.departures.length === 0 ? (
            <div className="py-5 text-center">
              <p className="font-semibold text-white">{data.staying ? `${data.staying.guestName} está alojado` : 'Sin movimientos hoy'}</p>
              <p className="text-xs text-emerald-200/55 mt-0.5">
                {data.staying ? `Sale el ${fmtDate(data.staying.endDate, { weekday: 'long', day: 'numeric', month: 'long' })}` : 'La casa está libre'}
              </p>
            </div>
          ) : (
            <>
              {data.departures.map((r) => <GuestRow key={`o-${r.id}`} r={r} kind="out" />)}
              {data.arrivals.map((r) => <GuestRow key={`i-${r.id}`} r={r} kind="in" />)}
            </>
          )}
        </Card>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs font-semibold text-emerald-200/60">Ocupación del mes</p>
          <p className="font-serif text-4xl font-bold text-white mt-1 tabular-nums">{data.occupancy}%</p>
          <div className="mt-3 h-2 rounded-full bg-emerald-950 overflow-hidden" role="meter" aria-valuenow={data.occupancy} aria-valuemin={0} aria-valuemax={100} aria-label="Ocupación del mes">
            <motion.div className="h-full rounded-full bg-emerald-400" initial={{ width: 0 }} animate={{ width: `${data.occupancy}%` }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
          </div>
          <p className="text-xs text-emerald-200/50 mt-2">{data.busyDays} de {data.daysInMonth} noches</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold text-emerald-200/60">Ingresos del mes</p>
          <p className="font-serif text-3xl font-bold text-white mt-1 tabular-nums">{money(monthTotal)}</p>
          <p className="text-xs text-emerald-200/50 mt-3">Reservas confirmadas con llegada este mes</p>
        </Card>
      </section>

      <section>
        <SectionTitle title="Ingresos, últimos 6 meses" hint="Toca una barra para ver el importe" />
        <Card>
          <div className="flex items-end gap-2 h-40" role="img" aria-label="Ingresos por mes">
            {data.months.map((m, i) => {
              const h = Math.max(4, Math.round((m.total / max) * 100));
              const on = active === i;
              return (
                <button key={i} onClick={() => setActive(on ? null : i)} className="flex-1 h-full flex flex-col justify-end items-center gap-1.5 cursor-pointer min-w-0" aria-label={`${MONTHS[m.m]}: ${money(m.total)}`}>
                  <span className={`text-[11px] font-semibold tabular-nums transition-opacity ${on || i === 5 ? 'opacity-100 text-white' : 'opacity-0'}`}>{m.total > 0 ? money(m.total) : '–'}</span>
                  <motion.span
                    className={`w-full rounded-t-md ${i === 5 ? 'bg-emerald-400' : on ? 'bg-emerald-300' : 'bg-emerald-500/55'}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  />
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 mt-2 border-t border-emerald-400/10 pt-2">
            {data.months.map((m, i) => (
              <span key={i} className={`flex-1 text-center text-xs capitalize ${i === 5 ? 'text-white font-semibold' : 'text-emerald-200/55'}`}>{MONTHS[m.m]}</span>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <SectionTitle title="Próximas llegadas" />
        {data.upcoming.length === 0 ? (
          <Card><p className="text-sm text-emerald-200/60 text-center py-2">No hay llegadas programadas</p></Card>
        ) : (
          <Card className="!py-1 divide-y divide-emerald-400/10">
            {data.upcoming.map((r) => (
              <button key={r.id} onClick={() => ctx.goTab('reservations', r.id)} className="w-full flex items-center gap-3 py-3 text-left cursor-pointer">
                <span className="w-12 shrink-0 text-center rounded-xl bg-emerald-950 py-1.5">
                  <span className="block font-serif text-xl font-bold text-white leading-none tabular-nums">{new Date(r.startDate).getUTCDate()}</span>
                  <span className="block text-[11px] uppercase text-emerald-300/70 mt-0.5">{MONTHS[new Date(r.startDate).getUTCMonth()]}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-white truncate">{r.guestName}</span>
                  <span className="block text-xs text-emerald-200/55">{nightsBetween(r.startDate, r.endDate)} noches · {r.guestsCount} huéspedes</span>
                </span>
                <span className="text-sm font-bold text-emerald-300 tabular-nums">{money(r.totalPrice)}</span>
              </button>
            ))}
          </Card>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Btn tone="primary" onClick={() => ctx.openCreate()}><CalendarPlus className="w-5 h-5" />Nueva reserva</Btn>
        <Btn onClick={() => ctx.goTab('calendar')}><Lock className="w-4 h-4" />Bloquear fechas</Btn>
      </div>
    </div>
  );
};
