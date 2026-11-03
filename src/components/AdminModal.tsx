import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarDays, CalendarRange, Home, Loader2, LayoutTemplate, MoreHorizontal, Save, Undo2, X, ExternalLink } from 'lucide-react';
import { api } from '../api';
import { AdminCalendarView } from './admin/AdminCalendarView';
import { AdminCreateReservationModal } from './admin/AdminCreateReservationModal';
import { AdminWhatsAppQuickModal } from './admin/AdminWhatsAppQuickModal';
import { CheckInVoucherModal } from './CheckInVoucherModal';
import { Toast, ToastState } from './Toast';
import { TodayTab } from './admin/TodayTab';
import { ReservationsTab } from './admin/ReservationsTab';
import { WebTab } from './admin/WebTab';
import { MoreTab, MoreSub } from './admin/MoreTab';
import { Btn, Sheet, todayYmd } from './admin/ui';
import type { AdminCtx } from './admin/types';

interface AdminModalProps {
  onClose: () => void;
  onRefreshData?: () => void;
}

type Tab = 'today' | 'reservations' | 'calendar' | 'web' | 'more';

const TABS: Array<{ id: Tab; label: string; icon: React.ComponentType<any> }> = [
  { id: 'today', label: 'Hoy', icon: Home },
  { id: 'reservations', label: 'Reservas', icon: CalendarRange },
  { id: 'calendar', label: 'Calendario', icon: CalendarDays },
  { id: 'web', label: 'Web', icon: LayoutTemplate },
  { id: 'more', label: 'Más', icon: MoreHorizontal },
];

export const AdminModal: React.FC<AdminModalProps> = ({ onClose, onRefreshData }) => {
  const [tab, setTab] = useState<Tab>('today');
  const [subHint, setSubHint] = useState<string | undefined>();
  const [moreSub, setMoreSub] = useState<MoreSub | null>(null);
  const [loading, setLoading] = useState(true);

  const [reservations, setReservations] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [googleEvents, setGoogleEvents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState<any>(null);

  const [saved, setSaved] = useState<Record<string, any>>({});
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState<ToastState | null>(null);
  const [createFor, setCreateFor] = useState<string | null>(null);
  const [messagesFor, setMessagesFor] = useState<any | null>(null);
  const [voucherFor, setVoucherFor] = useState<any | null>(null);
  const [ask, setAsk] = useState<{ message: string; confirmLabel: string; danger: boolean; resolve: (v: boolean) => void } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const [resRes, usersRes, blockRes, tplRes, propRes, revRes, exchRes, availRes] = await Promise.all([
      api.getAdminReservations().catch(() => ({ reservations: [] })),
      api.getAdminUsers().catch(() => ({ users: [] })),
      api.getBlockedDates().catch(() => ({ blockedDates: [] })),
      api.getEmailTemplates().catch(() => ({ templates: [] })),
      api.getPropertySettings().catch(() => ({ settings: {} })),
      api.getAdminReviews().catch(() => ({ reviews: [] })),
      api.getExchangeRate().catch(() => ({})),
      api.getAvailability().catch(() => ({ googleCalendarEvents: [] })),
    ]);
    setGoogleEvents(availRes.googleCalendarEvents || []);
    setReservations(resRes.reservations || []);
    setUsers(usersRes.users || []);
    setBlockedDates(blockRes.blockedDates || []);
    setTemplates(tplRes.templates || []);
    setReviews(revRes.reviews || []);
    setExchangeRate(exchRes || null);
    return propRes.settings || {};
  }, []);

  useEffect(() => {
    load().then((s) => {
      setSaved(s);
      setSettings(s);
      setLoading(false);
    });
  }, [load]);

  const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(saved), [settings, saved]);

  // Warn before leaving the browser tab with unsaved edits
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const notify = useCallback((type: 'success' | 'error', message: string) => setToast({ type, message }), []);

  const confirm: AdminCtx['confirm'] = useCallback(
    (message, opts) =>
      new Promise<boolean>((resolve) => setAsk({ message, confirmLabel: opts?.confirmLabel || 'Confirmar', danger: !!opts?.danger, resolve })),
    []
  );
  const answer = (v: boolean) => {
    ask?.resolve(v);
    setAsk(null);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.updatePropertySettings(settings);
      setSaved(settings);
      notify('success', 'Cambios publicados en la web.');
      onRefreshData?.();
    } catch (e: any) {
      notify('error', e.message || 'No se pudieron guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const requestClose = async () => {
    if (dirty && !(await confirm('Tienes cambios sin guardar. ¿Salir y descartarlos?', { confirmLabel: 'Salir sin guardar', danger: true }))) return;
    onClose();
  };

  const goTab: AdminCtx['goTab'] = (t, sub) => {
    setTab(t);
    setSubHint(sub);
    if (t === 'more') setMoreSub((sub as MoreSub) || null);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  const ctx: AdminCtx = {
    reservations,
    blockedDates,
    users,
    reviews,
    templates,
    exchangeRate,
    settings,
    setSetting: (key, value) => setSettings((s) => ({ ...s, [key]: value })),
    notify,
    confirm,
    reload: async () => {
      await load();
    },
    refreshPublic: () => onRefreshData?.(),
    goTab,
    openCreate: (date) => setCreateFor(date || todayYmd()),
    openMessages: (r) => setMessagesFor(r),
    openVoucher: (r) => setVoucherFor(r),
    setReviews,
    setExchangeRate,
  };

  const pending = reservations.filter((r) => r.status === 'PENDING').length;
  const toApprove = reviews.filter((r) => !r.visible).length;
  const tabIndex = TABS.findIndex((t) => t.id === tab);
  const prevTabIndex = useRef(tabIndex);
  const tabDir = tabIndex >= prevTabIndex.current ? 1 : -1;
  useEffect(() => { prevTabIndex.current = tabIndex; }, [tabIndex]);
  const showSaveBar = dirty && (tab === 'web' || tab === 'more');
  const price = Number(settings.price_per_night) || 150;
  const fee = Number(settings.cleaning_fee) || 50;

  return (
    <div className="admin-enter fixed inset-0 z-50 bg-emerald-950 text-emerald-50 font-sans flex flex-col">
      <header className="shrink-0 flex items-center justify-between gap-3 px-4 pt-[max(env(safe-area-inset-top),10px)] pb-2.5 border-b border-emerald-400/10 bg-emerald-950/95 backdrop-blur">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300/70">Panel de administración</p>
          <h1 className="font-serif text-xl font-bold text-white truncate leading-tight">{settings.property_title || 'Villa María'}</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <a href="/" target="_blank" rel="noopener noreferrer" aria-label="Ver la web" className="w-11 h-11 rounded-full text-emerald-200 hover:bg-emerald-800/60 flex items-center justify-center"><ExternalLink className="w-5 h-5" /></a>
          <button onClick={requestClose} aria-label="Cerrar panel" className="w-11 h-11 rounded-full bg-emerald-800/60 text-white flex items-center justify-center active:scale-90 transition-transform cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain" style={{ scrollbarWidth: 'thin' }}>
        <div className="max-w-3xl mx-auto px-4 pt-5 pb-40">
          {loading ? (
            <div className="space-y-4" aria-busy="true" aria-label="Cargando">
              {[120, 80, 180, 140].map((h, i) => <div key={i} className="rounded-2xl bg-emerald-900/40 animate-pulse" style={{ height: h }} />)}
            </div>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={tab} className="tab-stagger" initial={{ opacity: 0, x: tabDir * 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                {tab === 'today' && <TodayTab ctx={ctx} />}
                {tab === 'reservations' && <ReservationsTab ctx={ctx} initialFilter={subHint} />}
                {tab === 'calendar' && (
                  <AdminCalendarView
                    reservations={reservations}
                    blockedDates={blockedDates}
                    googleCalendarEvents={googleEvents}
                    propertySettings={settings}
                    onRefresh={() => { load(); onRefreshData?.(); }}
                    onShowAlert={(a) => notify(a.type, a.text)}
                  />
                )}
                {tab === 'web' && <WebTab ctx={ctx} initialSub={subHint} />}
                {tab === 'more' && <MoreTab ctx={ctx} sub={moreSub} setSub={setMoreSub} onLogout={requestClose} />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      <AnimatePresence>
        {showSaveBar && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="fixed inset-x-0 bottom-[calc(92px+env(safe-area-inset-bottom))] z-[60] px-3 pointer-events-none"
          >
            <div className="pointer-events-auto max-w-lg mx-auto flex items-center gap-2 rounded-2xl bg-emerald-900 border border-emerald-300/30 shadow-2xl p-2 pl-4">
              <span className="flex-1 text-sm font-semibold text-white">Cambios sin publicar</span>
              <Btn aria-label="Descartar cambios" disabled={saving} onClick={() => setSettings(saved)} className="!px-3"><Undo2 className="w-4 h-4" /></Btn>
              <Btn tone="primary" disabled={saving} onClick={save}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Guardar</Btn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav aria-label="Secciones del panel" className="fixed left-1/2 -translate-x-1/2 bottom-[max(env(safe-area-inset-bottom),12px)] z-[55] w-max max-w-[calc(100%-16px)] bg-[#2c2f2c] rounded-full p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <div className="flex gap-0.5">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            const badge = id === 'reservations' ? pending : id === 'more' ? toApprove : 0;
            return (
              <button key={id} onClick={() => goTab(id)} aria-current={active ? 'page' : undefined} className="relative w-[62px] min-h-[54px] flex flex-col items-center justify-center gap-0.5 rounded-full cursor-pointer active:scale-90 transition-transform">
                {active && <motion.span layoutId="admin-tab" className="absolute inset-0 rounded-full bg-emerald-300" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                <span className="relative">
                  <Icon className={`w-[22px] h-[22px] transition ${active ? 'text-[#1c1c1c]' : 'text-white/60'}`} />
                  {badge > 0 && <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-amber-950 text-[11px] font-bold flex items-center justify-center tabular-nums">{badge}</span>}
                </span>
                <span className={`relative text-[11px] font-semibold leading-none ${active ? 'text-[#1c1c1c]' : 'text-white/70'}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <Sheet open={!!ask} onClose={() => answer(false)} title="¿Seguro?">
        <p className="text-[15px] text-emerald-50/90 leading-relaxed text-pretty">{ask?.message}</p>
        <div className="grid grid-cols-2 gap-2.5">
          <Btn onClick={() => answer(false)}>Volver</Btn>
          <Btn tone={ask?.danger ? 'danger' : 'primary'} onClick={() => answer(true)}>{ask?.confirmLabel}</Btn>
        </div>
      </Sheet>

      {createFor !== null && (
        <AdminCreateReservationModal
          initialStartDate={createFor}
          initialEndDate=""
          pricePerNight={price}
          cleaningFee={fee}
          onClose={() => setCreateFor(null)}
          onSuccess={(r) => {
            setCreateFor(null);
            notify('success', `Reserva creada para ${r.guestName}.`);
            load();
            onRefreshData?.();
          }}
        />
      )}
      {messagesFor && (
        <AdminWhatsAppQuickModal
          reservation={{ id: messagesFor.id, guestName: messagesFor.guestName, guestEmail: messagesFor.guestEmail, guestPhone: messagesFor.guestPhone, startDate: messagesFor.startDate, endDate: messagesFor.endDate, totalPrice: messagesFor.totalPrice, status: messagesFor.status }}
          propertyAddress={settings.location_address}
          mapsUrl={settings.location_maps_link}
          wifiSsid={settings.wifi_ssid}
          wifiPass={settings.wifi_password}
          onClose={() => setMessagesFor(null)}
        />
      )}
      {voucherFor && (
        <CheckInVoucherModal
          reservation={{
            id: voucherFor.id, guestName: voucherFor.guestName, guestEmail: voucherFor.guestEmail, guestPhone: voucherFor.guestPhone,
            checkIn: voucherFor.startDate, checkOut: voucherFor.endDate, guestsCount: voucherFor.guestsCount, totalPrice: voucherFor.totalPrice, status: voucherFor.status,
            propertyAddress: settings.location_address, mapsUrl: settings.location_maps_link, wifiSsid: settings.wifi_ssid, wifiPass: settings.wifi_password,
            hostPhone: settings.whatsapp_number || settings.contact_phone,
          }}
          onClose={() => setVoucherFor(null)}
        />
      )}
    </div>
  );
};
