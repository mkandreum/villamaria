import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Check, Copy, CreditCard, Eye, EyeOff, Mail, MapPin, MessageSquareText, RefreshCw, Send, Server, Star, Trash2, Tag } from 'lucide-react';
import { api } from '../../api';
import type { AdminCtx } from './types';
import { Btn, Card, Chip, Empty, Field, SectionTitle, Toggle } from './ui';
import { SmtpSettingsSection } from './SmtpSettingsSection';

export type MoreSub = 'reviews' | 'prices' | 'contact' | 'email' | 'smtp';

const ITEMS: Array<{ id: MoreSub; label: string; hint: string; icon: React.ComponentType<any> }> = [
  { id: 'reviews', label: 'Reseñas', hint: 'Publica u oculta opiniones', icon: Star },
  { id: 'prices', label: 'Precios y pagos', hint: 'Tarifas, estancia mínima, métodos y tasa BCV', icon: Tag },
  { id: 'contact', label: 'Contacto y Wi-Fi', hint: 'Teléfono, correo, dirección y red', icon: MapPin },
  { id: 'email', label: 'Plantillas de correo', hint: 'Textos de los emails automáticos', icon: MessageSquareText },
  { id: 'smtp', label: 'Servidor de correo', hint: 'Configuración SMTP', icon: Server },
];

const Back: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <button onClick={onBack} className="flex items-center gap-1 -ml-2 mb-3 min-h-[44px] px-2 text-emerald-200 font-semibold cursor-pointer">
    <ChevronLeft className="w-5 h-5" />
    <span className="font-serif text-xl font-bold text-white">{title}</span>
  </button>
);

const Reviews: React.FC<{ ctx: AdminCtx }> = ({ ctx }) => {
  const toggle = async (r: any) => {
    try {
      await api.toggleReviewVisible(r.id, !r.visible);
      ctx.setReviews((prev) => prev.map((x) => (x.id === r.id ? { ...x, visible: !r.visible } : x)));
    } catch (e: any) {
      ctx.notify('error', e.message || 'No se pudo cambiar.');
    }
  };
  const remove = async (r: any) => {
    if (!(await ctx.confirm(`¿Eliminar la reseña de ${r.author}?`, { danger: true, confirmLabel: 'Eliminar' }))) return;
    try {
      await api.deleteReview(r.id);
      ctx.setReviews((prev) => prev.filter((x) => x.id !== r.id));
    } catch (e: any) {
      ctx.notify('error', e.message || 'No se pudo eliminar.');
    }
  };
  const sorted = [...ctx.reviews].sort((a, b) => Number(a.visible) - Number(b.visible));
  if (sorted.length === 0) return <Empty icon={<Star className="w-7 h-7" />} title="Sin reseñas" text="Las opiniones que dejen tus huéspedes aparecerán aquí para aprobarlas." />;
  return (
    <ul className="space-y-3">
      {sorted.map((r) => (
        <li key={r.id}><Card className={r.visible ? '' : 'border-amber-400/30'}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-white">{r.author}{r.location && <span className="font-normal text-emerald-200/55"> · {r.location}</span>}</p>
              <div className="flex gap-0.5 mt-1" aria-label={`${r.rating} de 5`}>{[0, 1, 2, 3, 4].map((i) => <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-amber-300 text-amber-300' : 'text-emerald-800'}`} />)}</div>
            </div>
            {!r.visible && <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">Por aprobar</span>}
          </div>
          <p className="text-[15px] text-emerald-50/90 mt-3 leading-relaxed text-pretty">“{r.comment}”</p>
          <div className="flex gap-2 mt-4">
            <Btn tone={r.visible ? 'soft' : 'primary'} className="flex-1" onClick={() => toggle(r)}>{r.visible ? <><EyeOff className="w-4 h-4" />Ocultar</> : <><Eye className="w-4 h-4" />Publicar</>}</Btn>
            <Btn tone="danger" aria-label="Eliminar reseña" className="!px-4" onClick={() => remove(r)}><Trash2 className="w-4 h-4" /></Btn>
          </div>
        </Card></li>
      ))}
    </ul>
  );
};

const Prices: React.FC<{ ctx: AdminCtx }> = ({ ctx }) => {
  const { settings: s, setSetting: set } = ctx;
  const [refreshing, setRefreshing] = useState(false);
  const on = (k: string) => s[k] !== false && s[k] !== 'false';
  const refresh = async () => {
    setRefreshing(true);
    try {
      const res: any = await api.refreshExchangeRate();
      ctx.setExchangeRate(res);
      ctx.notify('success', res?.rate != null ? `Tasa BCV actualizada: Bs. ${res.rate}` : 'La tasa BCV no está disponible ahora.');
    } catch (e: any) {
      ctx.notify('error', e.message || 'No se pudo actualizar la tasa.');
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <Field label="Precio por noche" suffix="US$" type="number" inputMode="decimal" value={s.price_per_night ?? ''} onChange={(v) => set('price_per_night', v)} />
        <Field label="Gastos de limpieza" suffix="US$" type="number" inputMode="decimal" value={s.cleaning_fee ?? ''} onChange={(v) => set('cleaning_fee', v)} />
        <Field label="Estancia mínima" suffix="noches" type="number" inputMode="numeric" value={s.minimum_stay_nights ?? ''} onChange={(v) => set('minimum_stay_nights', v)} />
      </Card>
      <SectionTitle title="Métodos de pago" hint="Los que se ofrecen al reservar." />
      <Card className="divide-y divide-emerald-400/10 !py-1">
        <Toggle label="Zelle" checked={on('payment_zelle_enabled')} onChange={(v) => set('payment_zelle_enabled', v)} />
        <Toggle label="Pago móvil" checked={on('payment_pago_movil_enabled')} onChange={(v) => set('payment_pago_movil_enabled', v)} />
        <Toggle label="Transferencia" checked={on('payment_transferencia_enabled')} onChange={(v) => set('payment_transferencia_enabled', v)} />
        <Toggle label="Efectivo" checked={on('payment_efectivo_enabled')} onChange={(v) => set('payment_efectivo_enabled', v)} />
      </Card>
      <Card className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-amber-200/70">Tasa BCV del día</p>
          <p className="font-serif text-2xl font-bold text-amber-100 tabular-nums">{ctx.exchangeRate?.rate != null ? `Bs. ${ctx.exchangeRate.rate}` : 'No disponible'}</p>
          {ctx.exchangeRate?.date && <p className="text-xs text-emerald-200/50">Actualizada {ctx.exchangeRate.date}</p>}
        </div>
        <Btn tone="warn" onClick={refresh} disabled={refreshing}><RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />Actualizar</Btn>
      </Card>
    </div>
  );
};

const Contact: React.FC<{ ctx: AdminCtx }> = ({ ctx }) => {
  const { settings: s, setSetting: set } = ctx;
  const f = (key: string, label: string, extra: Partial<React.ComponentProps<typeof Field>> = {}) => <Field key={key} label={label} value={s[key] ?? ''} onChange={(v) => set(key, v)} {...extra} />;
  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        {f('whatsapp_number', 'WhatsApp', { type: 'tel', inputMode: 'tel', placeholder: '+58 414 1234567', hint: 'Con código de país. Lo usan los botones de WhatsApp de la web.' })}
        {f('contact_phone', 'Teléfono', { type: 'tel', inputMode: 'tel' })}
        {f('contact_email', 'Correo principal', { type: 'email', inputMode: 'email', hint: 'Recibe los avisos de nuevas reservas.' })}
        {f('partner_emails', 'Correos de socios', { placeholder: 'socio1@gmail.com, socio2@gmail.com', hint: 'Separados por comas. También reciben los avisos.' })}
        {f('location_address', 'Dirección')}
      </Card>
      <SectionTitle title="Wi-Fi para huéspedes" hint="Se muestra en el pase digital y en los mensajes de llegada." />
      <Card className="space-y-4">
        {f('wifi_ssid', 'Nombre de la red')}
        {f('wifi_password', 'Contraseña')}
      </Card>
    </div>
  );
};

const Email: React.FC<{ ctx: AdminCtx }> = ({ ctx }) => {
  const [tpl, setTpl] = useState<any>(ctx.templates[0] || null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState('');
  const [manual, setManual] = useState({ to: '', subject: '', bodyHtml: '' });
  const [sending, setSending] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.updateEmailTemplate(tpl.code, { subject: tpl.subject, bodyHtml: tpl.bodyHtml });
      ctx.notify('success', 'Plantilla guardada.');
      await ctx.reload();
    } catch (e: any) {
      ctx.notify('error', e.message || 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.sendManualEmail(manual);
      ctx.notify('success', 'Correo enviado.');
      setManual({ to: '', subject: '', bodyHtml: '' });
    } catch (err: any) {
      ctx.notify('error', err.message || 'No se pudo enviar.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="no-scrollbar -mx-4 px-4 flex gap-2 overflow-x-auto">
        {ctx.templates.map((t) => <Chip key={t.code} active={tpl?.code === t.code} onClick={() => setTpl(t)}>{t.name}</Chip>)}
      </div>
      {tpl && (
        <Card className="space-y-4">
          <Field label="Asunto" value={tpl.subject} onChange={(v) => setTpl({ ...tpl, subject: v })} />
          <div>
            <p className="text-[13px] font-semibold text-emerald-100 mb-2">Variables (toca para copiar)</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {String(tpl.variables || '').split(',').filter(Boolean).map((v: string) => {
                const name = v.trim();
                return (
                  <button key={name} type="button" onClick={() => { navigator.clipboard?.writeText(name); setCopied(name); setTimeout(() => setCopied(''), 1500); }} className={`min-h-[36px] px-2.5 rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer ${copied === name ? 'bg-emerald-400 text-emerald-950' : 'bg-emerald-950 text-emerald-200 border border-emerald-400/20'}`}>
                    {copied === name ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3 opacity-60" />}{name}
                  </button>
                );
              })}
            </div>
            <Field label="Mensaje (HTML)" multiline rows={10} value={tpl.bodyHtml} onChange={(v) => setTpl({ ...tpl, bodyHtml: v })} />
          </div>
          <Btn tone="primary" block disabled={saving} onClick={save}>{saving ? 'Guardando…' : 'Guardar plantilla'}</Btn>
        </Card>
      )}
      <SectionTitle title="Enviar un correo a mano" />
      <form onSubmit={send}>
        <Card className="space-y-4">
          <Field label="Para" type="email" inputMode="email" placeholder="huesped@correo.com" value={manual.to} onChange={(v) => setManual({ ...manual, to: v })} />
          <Field label="Asunto" value={manual.subject} onChange={(v) => setManual({ ...manual, subject: v })} />
          <Field label="Mensaje" multiline rows={5} value={manual.bodyHtml} onChange={(v) => setManual({ ...manual, bodyHtml: v })} />
          <Btn type="submit" block disabled={sending || !manual.to || !manual.subject || !manual.bodyHtml}><Send className="w-4 h-4" />{sending ? 'Enviando…' : 'Enviar correo'}</Btn>
        </Card>
      </form>
    </div>
  );
};

export const MoreTab: React.FC<{ ctx: AdminCtx; sub: MoreSub | null; setSub: (s: MoreSub | null) => void; onLogout: () => void }> = ({ ctx, sub, setSub, onLogout }) => {
  const current = ITEMS.find((i) => i.id === sub);
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={sub || 'menu'} initial={{ opacity: 0, x: sub ? 24 : -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
        {!sub && (
          <div className="space-y-4">
            <h2 className="font-serif text-3xl font-bold text-white px-1">Más</h2>
            <Card className="!p-0 divide-y divide-emerald-400/10 overflow-hidden">
              {ITEMS.map(({ id, label, hint, icon: Icon }) => (
                <button key={id} onClick={() => setSub(id)} className="w-full flex items-center gap-3.5 p-4 text-left active:bg-emerald-900/60 transition cursor-pointer">
                  <span className="w-11 h-11 rounded-xl bg-emerald-950 text-emerald-300 flex items-center justify-center shrink-0"><Icon className="w-5 h-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-white">{label}{id === 'reviews' && ctx.reviews.some((r) => !r.visible) && <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-xs font-bold">{ctx.reviews.filter((r) => !r.visible).length}</span>}</span>
                    <span className="block text-xs text-emerald-200/55">{hint}</span>
                  </span>
                  <ChevronRight className="w-5 h-5 text-emerald-300/40 shrink-0" />
                </button>
              ))}
            </Card>
            <Btn block onClick={onLogout}>Cerrar panel</Btn>
          </div>
        )}
        {sub && current && (
          <div>
            <Back title={current.label} onBack={() => setSub(null)} />
            {sub === 'reviews' && <Reviews ctx={ctx} />}
            {sub === 'prices' && <Prices ctx={ctx} />}
            {sub === 'contact' && <Contact ctx={ctx} />}
            {sub === 'email' && <Email ctx={ctx} />}
            {sub === 'smtp' && <SmtpSettingsSection />}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
