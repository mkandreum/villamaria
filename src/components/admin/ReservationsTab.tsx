import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CalendarRange, CheckCircle2, Download, Mail, MessageCircle, MoreHorizontal, Phone, Plus, Search, Ticket, Trash2, X } from 'lucide-react';
import { api } from '../../api';
import type { AdminCtx } from './types';
import { Btn, Chip, Empty, Field, Sheet, STATUS, fmtDate, money, nightsBetween, ymd } from './ui';

const FILTERS: Array<{ id: string; label: string }> = [
  { id: 'ALL', label: 'Todas' },
  { id: 'PENDING', label: 'Pendientes' },
  { id: 'CONFIRMED', label: 'Confirmadas' },
  { id: 'CANCELLED', label: 'Canceladas' },
];

const waLink = (phone: string, text = '') => `https://wa.me/${(phone || '').replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const ReservationsTab: React.FC<{ ctx: AdminCtx; initialFilter?: string }> = ({ ctx, initialFilter }) => {
  const { reservations } = ctx;
  const [filter, setFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resched, setResched] = useState<{ start: string; end: string; extra: boolean; amount: string } | null>(null);

  useEffect(() => {
    if (!initialFilter) return;
    if (FILTERS.some((f) => f.id === initialFilter)) setFilter(initialFilter);
    else if (reservations.some((r) => r.id === initialFilter)) setOpenId(initialFilter);
  }, [initialFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: reservations.length };
    reservations.forEach((r) => (c[r.status] = (c[r.status] || 0) + 1));
    return c;
  }, [reservations]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reservations
      .filter((r) => (filter === 'ALL' ? true : r.status === filter))
      .filter((r) => !q || [r.guestName, r.guestEmail, r.guestPhone, r.id].some((v) => String(v || '').toLowerCase().includes(q)))
      .sort((a, b) => {
        const rank = (x: any) => (x.status === 'PENDING' ? 0 : x.status === 'CONFIRMED' ? 1 : 2);
        return rank(a) - rank(b) || ymd(a.startDate).localeCompare(ymd(b.startDate));
      });
  }, [reservations, filter, query]);

  const current = reservations.find((r) => r.id === openId) || null;

  const run = async (fn: () => Promise<any>, ok: string, close = true) => {
    setBusy(true);
    try {
      await fn();
      ctx.notify('success', ok);
      await ctx.reload();
      ctx.refreshPublic();
      if (close) {
        setOpenId(null);
        setResched(null);
      }
    } catch (e: any) {
      ctx.notify('error', e.message || 'No se pudo completar la acción.');
    } finally {
      setBusy(false);
    }
  };

  const confirmPayment = async (r: any) => {
    if (await ctx.confirm(`¿Confirmar el pago de ${r.guestName}? Se le enviará el correo de confirmación.`, { confirmLabel: 'Confirmar pago' }))
      run(() => api.confirmPayment(r.id), `Pago confirmado. Correo enviado a ${r.guestName}.`);
  };
  const cancel = async (r: any) => {
    if (await ctx.confirm(`¿Cancelar la reserva de ${r.guestName}? Las fechas quedarán libres.`, { confirmLabel: 'Cancelar reserva', danger: true }))
      run(() => api.updateReservationStatus(r.id, { status: 'CANCELLED' }), 'Reserva cancelada.');
  };
  const remove = async (r: any) => {
    if (await ctx.confirm(`¿Eliminar para siempre la reserva de ${r.guestName}? No se puede deshacer.`, { confirmLabel: 'Eliminar', danger: true }))
      run(() => api.deleteReservation(r.id), 'Reserva eliminada.');
  };
  const reschedule = (r: any) => {
    if (!resched?.start || !resched.end || resched.end <= resched.start) return ctx.notify('error', 'La salida debe ser posterior a la llegada.');
    run(
      () => api.rescheduleReservation(r.id, { newStartDate: resched.start, newEndDate: resched.end, additionalCost: resched.extra, additionalCostAmount: Number(resched.amount) || 0 }),
      'Reserva reprogramada y cliente avisado.'
    );
  };

  const exportCsv = () => {
    if (list.length === 0) return ctx.notify('error', 'No hay reservas para exportar.');
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['ID', 'Huésped', 'Email', 'Teléfono', 'Llegada', 'Salida', 'Huéspedes', 'Total USD', 'Estado', 'Notas'],
      ...list.map((r) => [r.id, r.guestName, r.guestEmail, r.guestPhone, ymd(r.startDate), ymd(r.endDate), r.guestsCount, r.totalPrice, r.status, r.notes]),
    ];
    const blob = new Blob(['﻿' + rows.map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `reservas_villamaria_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="w-5 h-5 text-emerald-300/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar huésped, teléfono…"
            className="w-full min-h-[48px] rounded-xl bg-emerald-950/80 border border-emerald-400/20 pl-11 pr-4 text-[15px] text-white placeholder:text-emerald-200/35 focus:outline-none focus:border-emerald-300"
          />
        </div>
        <Btn tone="primary" onClick={() => ctx.openCreate()} aria-label="Nueva reserva" className="!px-4"><Plus className="w-5 h-5" /></Btn>
        <Btn onClick={exportCsv} aria-label="Exportar a Excel" className="!px-4"><Download className="w-5 h-5" /></Btn>
      </div>

      <div className="no-scrollbar -mx-4 px-4 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)} count={counts[f.id] || 0}>{f.label}</Chip>
        ))}
      </div>

      {list.length === 0 ? (
        <Empty icon={<CalendarRange className="w-7 h-7" />} title="Nada por aquí" text="No hay reservas con este filtro." />
      ) : (
        <ul className="space-y-3">
          {list.map((r, i) => {
            const st = STATUS[r.status] || STATUS.PENDING;
            const nights = nightsBetween(r.startDate, r.endDate);
            return (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 8) * 0.03, duration: 0.3 }}
                className="rounded-2xl bg-emerald-900/35 border border-emerald-400/15 overflow-hidden"
              >
                <button onClick={() => setOpenId(r.id)} className="w-full text-left p-4 cursor-pointer active:bg-emerald-900/60 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-serif text-lg font-bold text-white truncate">{r.guestName}</p>
                      <p className="text-sm text-emerald-100/80 mt-0.5">
                        {fmtDate(r.startDate)} → {fmtDate(r.endDate)} · {nights} {nights === 1 ? 'noche' : 'noches'}
                      </p>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold border ${st.chip}`}>{st.label}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className="text-emerald-200/60">{r.guestsCount} huéspedes</span>
                    <span className="font-bold text-emerald-300 tabular-nums">{money(r.totalPrice)}</span>
                  </div>
                </button>
                <div className="flex gap-2 px-4 pb-4">
                  {r.status === 'PENDING' ? (
                    <Btn tone="primary" className="flex-1" onClick={() => confirmPayment(r)}><CheckCircle2 className="w-4 h-4" />Confirmar pago</Btn>
                  ) : (
                    <Btn className="flex-1" onClick={() => setOpenId(r.id)}>Ver detalles</Btn>
                  )}
                  {r.guestPhone && (
                    <a href={waLink(r.guestPhone, `Hola ${r.guestName}, `)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="min-h-[48px] w-12 rounded-xl bg-[#25D366] text-white flex items-center justify-center active:scale-95 transition-transform">
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  )}
                  <Btn onClick={() => setOpenId(r.id)} aria-label="Más acciones" className="!px-3"><MoreHorizontal className="w-5 h-5" /></Btn>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}

      <Sheet open={!!current} onClose={() => { setOpenId(null); setResched(null); }} title={current?.guestName}>
        {current && (
          <>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${(STATUS[current.status] || STATUS.PENDING).chip}`}>{(STATUS[current.status] || STATUS.PENDING).label}</span>
              <span className="text-xs text-emerald-200/45 font-mono">#{current.id.slice(0, 8)}</span>
            </div>

            <dl className="grid grid-cols-2 gap-3 rounded-2xl bg-emerald-900/40 border border-emerald-400/15 p-4 text-sm">
              <div><dt className="text-xs text-emerald-200/55">Llegada</dt><dd className="font-semibold text-white">{fmtDate(current.startDate, { weekday: 'short', day: 'numeric', month: 'short' })}</dd></div>
              <div><dt className="text-xs text-emerald-200/55">Salida</dt><dd className="font-semibold text-white">{fmtDate(current.endDate, { weekday: 'short', day: 'numeric', month: 'short' })}</dd></div>
              <div><dt className="text-xs text-emerald-200/55">Huéspedes</dt><dd className="font-semibold text-white">{current.guestsCount}</dd></div>
              <div><dt className="text-xs text-emerald-200/55">Total</dt><dd className="font-bold text-emerald-300 tabular-nums">{money(current.totalPrice)}</dd></div>
              {current.guestEmail && <div className="col-span-2"><dt className="text-xs text-emerald-200/55">Correo</dt><dd className="font-semibold text-white break-all">{current.guestEmail}</dd></div>}
              {current.notes && <div className="col-span-2"><dt className="text-xs text-emerald-200/55">Notas del cliente</dt><dd className="text-emerald-50 italic">“{current.notes}”</dd></div>}
              {current.internalNotes && <div className="col-span-2"><dt className="text-xs text-violet-300/70">Nota interna</dt><dd className="text-violet-100/90">{current.internalNotes}</dd></div>}
            </dl>

            {current.status === 'PENDING' && (
              <Btn tone="primary" block disabled={busy} onClick={() => confirmPayment(current)}><CheckCircle2 className="w-5 h-5" />Confirmar pago y avisar</Btn>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              {current.guestPhone && (
                <Btn tone="wa" onClick={() => window.open(waLink(current.guestPhone, `Hola ${current.guestName}, `), '_blank')}><MessageCircle className="w-4 h-4" />WhatsApp</Btn>
              )}
              {current.guestPhone && (
                <a href={`tel:${current.guestPhone}`} className="min-h-[48px] rounded-xl bg-emerald-800/60 border border-emerald-400/20 text-emerald-100 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"><Phone className="w-4 h-4" />Llamar</a>
              )}
              <Btn onClick={() => ctx.openMessages(current)}><Mail className="w-4 h-4" />Mensajes</Btn>
              <Btn onClick={() => ctx.openVoucher(current)}><Ticket className="w-4 h-4" />Pase QR</Btn>
            </div>

            {current.status !== 'CANCELLED' && (
              <div className="rounded-2xl border border-violet-400/25 bg-violet-950/30 p-4 space-y-3">
                <button
                  className="w-full flex items-center justify-between font-bold text-violet-200 min-h-[32px] cursor-pointer"
                  onClick={() => setResched(resched ? null : { start: ymd(current.startDate), end: ymd(current.endDate), extra: false, amount: '' })}
                >
                  <span className="flex items-center gap-2"><CalendarRange className="w-4 h-4" />Cambiar fechas</span>
                  <span className="text-xs text-violet-300/70">{resched ? 'Cerrar' : 'Abrir'}</span>
                </button>
                {resched && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Nueva llegada"><input type="date" value={resched.start} onChange={(e) => setResched({ ...resched, start: e.target.value })} className="w-full min-h-[48px] rounded-xl bg-emerald-950 border border-violet-400/30 px-3 text-[15px] text-white" /></Field>
                      <Field label="Nueva salida"><input type="date" min={resched.start} value={resched.end} onChange={(e) => setResched({ ...resched, end: e.target.value })} className="w-full min-h-[48px] rounded-xl bg-emerald-950 border border-violet-400/30 px-3 text-[15px] text-white" /></Field>
                    </div>
                    <label className="flex items-center gap-3 min-h-[44px] text-sm text-violet-100 cursor-pointer">
                      <input type="checkbox" checked={resched.extra} onChange={(e) => setResched({ ...resched, extra: e.target.checked })} className="w-5 h-5 accent-violet-400" />
                      Cobrar un importe adicional
                    </label>
                    {resched.extra && <Field label="Importe adicional" suffix="US$" type="number" inputMode="decimal" value={resched.amount} onChange={(v) => setResched({ ...resched, amount: v })} />}
                    <Btn block disabled={busy} className="!bg-violet-500 !text-white !border-0" onClick={() => reschedule(current)}>Guardar nuevas fechas</Btn>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {current.status !== 'CANCELLED' && current.status !== 'COMPLETED' && <Btn tone="warn" onClick={() => cancel(current)}><X className="w-4 h-4" />Cancelar</Btn>}
              <Btn tone="danger" onClick={() => remove(current)}><Trash2 className="w-4 h-4" />Eliminar</Btn>
            </div>
          </>
        )}
      </Sheet>
    </div>
  );
};
