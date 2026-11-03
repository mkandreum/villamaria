import React, { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Star, Trash2 } from 'lucide-react';
import { api } from '../../api';
import { SITE_TEXTS } from '../../../server/siteTexts';
import type { AdminCtx } from './types';
import { SECTION_DEFS, NO_FILTER, galleryFilters, orderedSections, hiddenSections, photoFilterId } from '../../context/SiteContext';
import { ICON_CHOICES } from '../../utils/icons';
import { Btn, Card, Chip, Empty, Field, SectionTitle, Toggle, asList } from './ui';

type Sub = 'brand' | 'sections' | 'share' | 'nav' | 'booking' | 'reviews' | 'account' | 'voucher' | 'weather' | 'photos' | 'banner' | 'hero' | 'titles' | 'amenities' | 'attractions' | 'faq' | 'location' | 'footer';
const SUBS: Array<{ id: Sub; label: string }> = [
  { id: 'brand', label: 'Marca' },
  { id: 'sections', label: 'Secciones' },
  { id: 'share', label: 'Google y WhatsApp' },
  { id: 'photos', label: 'Fotos' },
  { id: 'banner', label: 'Banner' },
  { id: 'hero', label: 'Portada' },
  { id: 'titles', label: 'Títulos' },
  { id: 'amenities', label: 'Servicios' },
  { id: 'attractions', label: 'Atracciones' },
  { id: 'faq', label: 'Normas y FAQ' },
  { id: 'location', label: 'Ubicación' },
  { id: 'footer', label: 'Pie de página' },
  { id: 'nav', label: 'Menús' },
  { id: 'booking', label: 'Reserva' },
  { id: 'reviews', label: 'Opiniones' },
  { id: 'account', label: 'Cuenta' },
  { id: 'voucher', label: 'Pase de entrada' },
  { id: 'weather', label: 'Tiempo' },
];

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Generic editor for a list of cards: add, reorder, remove. */
function ListEditor<T extends Record<string, any>>({
  items,
  onChange,
  make,
  label,
  addLabel,
  children,
  confirm,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  make: () => T;
  label: (item: T, i: number) => string;
  addLabel: string;
  children: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
  confirm: AdminCtx['confirm'];
}) {
  const move = (i: number, d: number) => {
    const next = [...items];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <Card key={item.id || i} className="space-y-3.5">
          <div className="flex items-center gap-1.5">
            <span className="w-7 h-7 rounded-full bg-emerald-950 text-emerald-300 text-xs font-bold flex items-center justify-center tabular-nums shrink-0">{i + 1}</span>
            <p className="flex-1 min-w-0 font-semibold text-white truncate">{label(item, i) || 'Sin título'}</p>
            <button aria-label="Subir" disabled={i === 0} onClick={() => move(i, -1)} className="w-10 h-10 rounded-lg text-emerald-200 disabled:opacity-25 hover:bg-emerald-800/60 flex items-center justify-center cursor-pointer"><ArrowUp className="w-4 h-4" /></button>
            <button aria-label="Bajar" disabled={i === items.length - 1} onClick={() => move(i, 1)} className="w-10 h-10 rounded-lg text-emerald-200 disabled:opacity-25 hover:bg-emerald-800/60 flex items-center justify-center cursor-pointer"><ArrowDown className="w-4 h-4" /></button>
            <button
              aria-label="Eliminar"
              onClick={async () => (await confirm(`¿Eliminar “${label(item, i) || 'este elemento'}”?`, { danger: true, confirmLabel: 'Eliminar' })) && onChange(items.filter((_, k) => k !== i))}
              className="w-10 h-10 rounded-lg text-rose-300 hover:bg-rose-500/15 flex items-center justify-center cursor-pointer"
            ><Trash2 className="w-4 h-4" /></button>
          </div>
          {children(item, (patch) => onChange(items.map((x, k) => (k === i ? { ...x, ...patch } : x))))}
        </Card>
      ))}
      <Btn block onClick={() => onChange([...items, make()])} className="border-dashed"><Plus className="w-5 h-5" />{addLabel}</Btn>
    </div>
  );
}

export const WebTab: React.FC<{ ctx: AdminCtx; initialSub?: string }> = ({ ctx, initialSub }) => {
  const [sub, setSub] = useState<Sub>((SUBS.find((s) => s.id === initialSub)?.id as Sub) || 'brand');
  const { settings: s, setSetting: set } = ctx;
  const text = (key: string, label: string, extra: Partial<React.ComponentProps<typeof Field>> = {}) => (
    <Field key={key} label={label} value={s[key] ?? ''} onChange={(v) => set(key, v)} {...extra} />
  );

  // ---------- photos ----------
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [pickedCat, setPickedCat] = useState('');
  const filters = galleryFilters(s);
  const CATS = [...filters.map((f) => ({ id: f.id, label: f.label || 'Sin nombre' })), { id: NO_FILTER, label: 'Sin filtro' }];
  const uploadCat = CATS.find((c) => c.id === pickedCat)?.id ?? CATS[0].id;
  const photos = asList<any>(s.gallery_images).map((p) => (typeof p === 'string' ? { url: p, category: NO_FILTER } : { url: p.url || p.imageUrl, category: photoFilterId(p.category, filters) }));
  const setPhotos = (next: any[]) => set('gallery_images', next);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    setUploading({ done: 0, total: list.length });
    const added: any[] = [];
    for (const file of list) {
      try {
        const res = await api.uploadFile(file);
        added.push({ url: res.url, category: uploadCat });
      } catch (e: any) {
        ctx.notify('error', `${file.name}: ${e.message || 'no se pudo subir'}`);
      }
      setUploading((u) => (u ? { ...u, done: u.done + 1 } : u));
    }
    if (added.length) {
      setPhotos([...photos, ...added]);
      ctx.notify('success', `${added.length} ${added.length === 1 ? 'foto añadida' : 'fotos añadidas'}. Guarda para publicarlas.`);
    }
    setUploading(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const movePhoto = (i: number, d: number) => {
    const next = [...photos];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setPhotos(next);
  };

  // ---------- lists ----------
  const amenities = asList<any>(s.amenities).map((a) => ({ id: a.id || uid(), title: a.title || a.name || '', description: a.description || '', icon: a.icon || '' }));
  const attractions = asList<any>(s.attractions).map((a) => ({
    id: a.id || uid(),
    title: a.title || a.name || '',
    duration: a.duration || a.travelTime || a.time || '',
    description: a.description || '',
    imageUrl: a.imageUrl || a.url || '',
  }));
  const faqs = asList<any>(s.faqs).map((f) => ({ id: f.id || uid(), question: f.question || f.q || '', answer: f.answer || f.a || '' }));
  const banner = asList<any>(s.banner_items).map((b) => ({ id: b.id || uid(), badge: b.badge || '', text: b.text || '' }));

  const [uploadingAttr, setUploadingAttr] = useState<string | null>(null);
  const attrImage = async (id: string, file?: File | null, patch?: (url: string) => void) => {
    if (!file) return;
    setUploadingAttr(id);
    try {
      patch?.((await api.uploadFile(file)).url);
    } catch (e: any) {
      ctx.notify('error', e.message || 'No se pudo subir la imagen.');
    } finally {
      setUploadingAttr(null);
    }
  };

  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const pickImage = async (key: string, file?: File | null) => {
    if (!file) return;
    setUploadingKey(key);
    try {
      set(key, (await api.uploadFile(file)).url);
    } catch (e: any) {
      ctx.notify('error', e.message || 'No se pudo subir la imagen.');
    } finally {
      setUploadingKey(null);
    }
  };
  const imageField = (key: string, label: string, hint: string, round = false) => (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-3">
        <div className={`w-16 h-16 shrink-0 overflow-hidden bg-emerald-950 border border-emerald-400/20 ${round ? 'rounded-full' : 'rounded-xl'}`}>
          {s[key] ? <img src={s[key]} alt="" className="w-full h-full object-cover" /> : null}
        </div>
        <label className="min-h-[48px] px-4 rounded-xl bg-emerald-800/60 text-white font-semibold flex items-center gap-2 cursor-pointer">
          {uploadingKey === key ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
          {s[key] ? 'Cambiar' : 'Subir imagen'}
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => { pickImage(key, e.target.files?.[0]); e.target.value = ''; }} />
        </label>
        {s[key] ? <button type="button" onClick={() => set(key, '')} className="min-h-[48px] px-3 text-sm text-rose-300 cursor-pointer">Quitar</button> : null}
      </div>
    </Field>
  );

  // Every fixed label of the site, written out in the tab where it belongs
  const textGroup = (group: string, title = 'Otros textos de esta parte') => {
    const items = SITE_TEXTS.filter((x) => x.group === group && x.key !== 'weather_lat' && x.key !== 'weather_lon');
    if (items.length === 0) return null;
    return (
      <Card className="space-y-4">
        <p className="font-semibold text-white">{title}</p>
        {items.map((x) => text(x.key, x.label, x.value.length > 60 ? { multiline: true, rows: 3 } : {}))}
        <p className="text-xs text-emerald-200/50">Si borras un texto, deja de salir en la web.</p>
      </Card>
    );
  };

  const order = orderedSections(s.sections_order);
  const hidden = hiddenSections(s.sections_hidden);
  const moveSection = (i: number, d: number) => {
    const next = [...order];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set('sections_order', next);
  };
  const toggleSection = (id: string, visible: boolean) =>
    set('sections_hidden', visible ? hidden.filter((x) => x !== id) : [...hidden, id]);

  return (
    <div className="space-y-5">
      <div className="no-scrollbar -mx-4 px-4 flex gap-2 overflow-x-auto sticky top-0 z-10 py-2 bg-emerald-950/95 backdrop-blur">
        {SUBS.map((x) => <Chip key={x.id} active={sub === x.id} onClick={() => setSub(x.id)}>{x.label}</Chip>)}
      </div>

      {sub === 'photos' && (
        <section className="space-y-4">
          <SectionTitle title="Filtros de la galería" hint="Los botones que hay sobre las fotos en la web. Cada foto se asigna a uno más abajo." />
          <Card>{text('gallery_cat1', 'Botón que muestra todas las fotos')}</Card>
          <ListEditor items={filters} onChange={(v) => set('gallery_filters', v)} make={() => ({ id: uid(), label: '' })} label={(f) => f.label} addLabel="Añadir filtro" confirm={ctx.confirm}>
            {(f, up) => <Field label="Nombre del filtro" placeholder="Ej: Ávila Room" value={f.label} onChange={(v) => up({ label: v })} />}
          </ListEditor>
          <p className="text-xs text-emerald-200/55 px-1">Un filtro sin fotos no sale en la web. Si eliminas uno, sus fotos pasan a “Sin filtro” y solo se ven en el botón de todas.</p>

          <SectionTitle title="Galería de fotos" hint="La primera foto es la portada de la web. Cambia el orden con las flechas." />
          <Card className="space-y-3">
            <div className="flex gap-2 no-scrollbar overflow-x-auto">
              {CATS.map((c) => <Chip key={c.id} active={uploadCat === c.id} onClick={() => setPickedCat(c.id)}>{c.label}</Chip>)}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
            <Btn tone="primary" block disabled={!!uploading} onClick={() => fileRef.current?.click()}>
              {uploading ? <><Loader2 className="w-5 h-5 animate-spin" />Subiendo {uploading.done}/{uploading.total}…</> : <><ImagePlus className="w-5 h-5" />Añadir fotos en “{CATS.find((c) => c.id === uploadCat)?.label}”</>}
            </Btn>
          </Card>

          {photos.length === 0 ? (
            <Empty icon={<ImagePlus className="w-7 h-7" />} title="Aún no hay fotos" text="La galería no sale en la web hasta que añadas alguna." />
          ) : (
            <ul className="grid grid-cols-2 gap-3">
              {photos.map((p, i) => (
                <li key={`${p.url}-${i}`} className="rounded-2xl overflow-hidden bg-emerald-900/40 border border-emerald-400/15">
                  <div className="relative aspect-[4/3] bg-emerald-950">
                    <img src={p.url} alt={`Foto ${i + 1}`} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                    {i === 0 && <span className="absolute top-2 left-2 px-2 py-1 rounded-full bg-emerald-400 text-emerald-950 text-[11px] font-bold flex items-center gap-1"><Star className="w-3 h-3 fill-current" />Portada</span>}
                    <button
                      aria-label="Eliminar foto"
                      onClick={async () => (await ctx.confirm('¿Quitar esta foto de la galería?', { danger: true, confirmLabel: 'Quitar' })) && setPhotos(photos.filter((_, k) => k !== i))}
                      className="absolute top-1.5 right-1.5 w-10 h-10 rounded-full bg-black/60 backdrop-blur text-rose-200 flex items-center justify-center cursor-pointer"
                    ><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="p-2 space-y-2">
                    <select
                      aria-label="Categoría"
                      value={p.category}
                      onChange={(e) => setPhotos(photos.map((x, k) => (k === i ? { ...x, category: e.target.value } : x)))}
                      className="w-full min-h-[44px] rounded-lg bg-emerald-950 border border-emerald-400/20 px-2 text-sm text-white"
                    >
                      {CATS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                    <div className="flex gap-1.5">
                      <button aria-label="Mover antes" disabled={i === 0} onClick={() => movePhoto(i, -1)} className="flex-1 min-h-[40px] rounded-lg bg-emerald-800/50 disabled:opacity-25 text-emerald-100 flex items-center justify-center cursor-pointer"><ArrowUp className="w-4 h-4 -rotate-90" /></button>
                      <button aria-label="Mover después" disabled={i === photos.length - 1} onClick={() => movePhoto(i, 1)} className="flex-1 min-h-[40px] rounded-lg bg-emerald-800/50 disabled:opacity-25 text-emerald-100 flex items-center justify-center cursor-pointer"><ArrowDown className="w-4 h-4 -rotate-90" /></button>
                      {i !== 0 && <button aria-label="Hacer portada" onClick={() => setPhotos([photos[i], ...photos.filter((_, k) => k !== i)])} className="flex-1 min-h-[40px] rounded-lg bg-amber-400/15 text-amber-200 flex items-center justify-center cursor-pointer"><Star className="w-4 h-4" /></button>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {sub === 'banner' && (
        <section className="space-y-4">
          <SectionTitle title="Banner superior" hint="La franja animada que aparece sobre la web." />
          <Card><Toggle label="Mostrar el banner" hint="Si lo apagas desaparece de toda la web." checked={s.banner_enabled !== false && s.banner_enabled !== 'false'} onChange={(v) => set('banner_enabled', v)} /></Card>
          <p className="text-xs text-emerald-200/55 px-1">Cada mensaje rota en el banner. Si no añades ninguno, se usan los mensajes por defecto.</p>
          <ListEditor items={banner} onChange={(v) => set('banner_items', v)} make={() => ({ id: uid(), badge: '', text: '' })} label={(b) => b.text} addLabel="Añadir mensaje" confirm={ctx.confirm}>
            {(b, up) => (
              <>
                <Field label="Etiqueta corta (opcional)" placeholder="Ej: Oferta" value={b.badge} onChange={(v) => up({ badge: v })} />
                <Field label="Mensaje" multiline rows={2} placeholder="Ej: 10% de descuento reservando 5 noches" value={b.text} onChange={(v) => up({ text: v })} />
              </>
            )}
          </ListEditor>
        </section>
      )}

      {sub === 'hero' && (
        <section className="space-y-4">
          <SectionTitle title="Portada" hint="Lo primero que ve el visitante." />
          <Card className="space-y-4">
            {text('property_title', 'Nombre de la propiedad')}
            {text('property_subtitle', 'Frase destacada')}
            {text('property_description', 'Descripción', { multiline: true, rows: 4 })}
            {text('hero_photo_badge', 'Etiqueta sobre la foto')}
          </Card>
          <Card className="space-y-4">
            <p className="font-semibold text-white">Cuatro características</p>
            {[1, 2, 3, 4].map((n) => text(`hero_feat${n}`, `Característica ${n}`))}
            <p className="text-xs text-emerald-200/50">Las que dejes vacías no salen en la web. El icono se elige solo según las palabras.</p>
          </Card>
          <Card className="space-y-4">
            <p className="font-semibold text-white">Tarjeta de precio</p>
            {text('hero_price_label', 'Texto bajo el precio')}
            <div className="grid grid-cols-2 gap-3">
              {text('hero_rating', 'Puntuación')}
              {text('hero_reviews_count', 'Nº de reseñas', { inputMode: 'numeric' })}
            </div>
            {text('whatsapp_greeting', 'Mensaje inicial de WhatsApp', { multiline: true, rows: 2, hint: 'Se escribe solo cuando alguien pulsa el botón de WhatsApp de la portada.' })}
          </Card>
          {textGroup('hero')}
        </section>
      )}

      {sub === 'titles' && (
        <section className="space-y-4">
          <SectionTitle title="Títulos de cada sección" hint="Título grande y frase de apoyo." />
          {[
            ['gallery', 'Fotos'],
            ['amenities', 'Servicios'],
            ['attractions', 'Atracciones'],
            ['faq', 'Normas y preguntas'],
          ].map(([k, name]) => (
            <Card key={k} className="space-y-4">
              <p className="font-semibold text-white">{name}</p>
              {text(`${k}_title`, 'Título')}
              {text(`${k}_subtitle`, 'Frase de apoyo', { multiline: true, rows: 2 })}
            </Card>
          ))}
        </section>
      )}

      {sub === 'amenities' && (
        <section className="space-y-4">
          <SectionTitle title="Servicios incluidos" hint="Elige un icono o deja que se asigne solo según el nombre." />
          <ListEditor items={amenities} onChange={(v) => set('amenities', v)} make={() => ({ id: uid(), title: '', description: '', icon: '' })} label={(a) => a.title} addLabel="Añadir servicio" confirm={ctx.confirm}>
            {(a, up) => (
              <>
                <Field label="Nombre" placeholder="Ej: Planta eléctrica 24/7" value={a.title} onChange={(v) => up({ title: v })} />
                <Field label="Descripción" multiline rows={2} value={a.description} onChange={(v) => up({ description: v })} />
                <Field label="Icono">
                  <select
                    value={a.icon}
                    onChange={(e) => up({ icon: e.target.value })}
                    className="w-full min-h-[48px] rounded-xl bg-emerald-950 border border-emerald-400/20 px-3 text-base text-white"
                  >
                    <option value="">Automático (según el nombre)</option>
                    {Object.entries(ICON_CHOICES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </Field>
              </>
            )}
          </ListEditor>
        </section>
      )}

      {sub === 'attractions' && (
        <section className="space-y-4">
          <SectionTitle title="Atracciones cercanas" hint="Cayos, playas y planes a poca distancia." />
          <ListEditor items={attractions} onChange={(v) => set('attractions', v)} make={() => ({ id: uid(), title: '', duration: '', description: '', imageUrl: '' })} label={(a) => a.title} addLabel="Añadir atracción" confirm={ctx.confirm}>
            {(a, up) => (
              <>
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-emerald-950">
                  {a.imageUrl ? <img src={a.imageUrl} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-emerald-200/40 text-sm">Sin imagen</div>}
                  <label className="absolute bottom-2 right-2 min-h-[44px] px-3.5 rounded-full bg-black/65 backdrop-blur text-white text-sm font-semibold flex items-center gap-2 cursor-pointer">
                    {uploadingAttr === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}{a.imageUrl ? 'Cambiar' : 'Subir'}
                    <input type="file" accept="image/*" hidden onChange={(e) => attrImage(a.id, e.target.files?.[0], (url) => up({ imageUrl: url }))} />
                  </label>
                </div>
                <Field label="Nombre" value={a.title} onChange={(v) => up({ title: v })} placeholder="Cayo Sombrero" />
                <Field label="Cuánto se tarda" value={a.duration} onChange={(v) => up({ duration: v })} placeholder="15 min en lancha" />
                <Field label="Descripción" multiline rows={3} value={a.description} onChange={(v) => up({ description: v })} />
              </>
            )}
          </ListEditor>
          {textGroup('attractions')}
        </section>
      )}

      {sub === 'faq' && (
        <section className="space-y-4">
          <SectionTitle title="Normas, cancelación y preguntas" hint="Aparecen en la sección “Información” de la web." />
          <Card className="space-y-4">
            <Field label="Normas de la casa" multiline rows={7} value={s.house_rules ?? ''} onChange={(v) => set('house_rules', v)} hint="Una norma por línea." />
            <Field label="Política de cancelación" multiline rows={3} value={s.cancellation_policy ?? ''} onChange={(v) => set('cancellation_policy', v)} />
          </Card>
          <SectionTitle title="Preguntas frecuentes" />
          <ListEditor items={faqs} onChange={(v) => set('faqs', v)} make={() => ({ id: uid(), question: '', answer: '' })} label={(f) => f.question} addLabel="Añadir pregunta" confirm={ctx.confirm}>
            {(f, up) => (
              <>
                <Field label="Pregunta" value={f.question} onChange={(v) => up({ question: v })} />
                <Field label="Respuesta" multiline rows={4} value={f.answer} onChange={(v) => up({ answer: v })} />
              </>
            )}
          </ListEditor>
          {textGroup('faq')}
        </section>
      )}

      {sub === 'location' && (
        <section className="space-y-4">
          <SectionTitle title="Ubicación" />
          <Card className="space-y-4">
            {text('location_title', 'Título')}
            {text('location_subtitle', 'Frase de apoyo', { multiline: true, rows: 2 })}
            {text('location_address', 'Dirección')}
            {text('location_description', 'Cómo llegar', { multiline: true, rows: 3 })}
            {text('location_maps_link', 'Enlace de Google Maps', { type: 'url', inputMode: 'url' })}
            {text('location_embed_url', 'Mapa incrustado (opcional)', { hint: 'Pega el enlace “Insertar un mapa” de Google Maps.' })}
          </Card>
          <Card className="space-y-4">
            <p className="font-semibold text-white">Tres puntos destacados</p>
            {[1, 2, 3].map((n) => text(`location_bullet_${n}`, `Punto ${n}`))}
          </Card>
          {textGroup('location')}
        </section>
      )}

      {sub === 'nav' && <section className="space-y-4"><SectionTitle title="Menús" hint="Barra superior y barra inferior." />{textGroup('nav', 'Botones')}</section>}
      {sub === 'booking' && <section className="space-y-4"><SectionTitle title="Reserva" hint="Calendario, formulario y confirmación." />{textGroup('booking', 'Textos')}</section>}
      {sub === 'reviews' && <section className="space-y-4"><SectionTitle title="Opiniones" hint="Las reseñas se aprueban en Más → Reseñas." />{textGroup('reviews', 'Textos')}</section>}
      {sub === 'account' && <section className="space-y-4"><SectionTitle title="Cuenta" hint="Acceso, registro y Mis reservas." />{textGroup('account', 'Textos')}</section>}
      {sub === 'voucher' && <section className="space-y-4"><SectionTitle title="Pase de entrada" hint="El Wi-Fi y las horas se editan en Más." />{textGroup('voucher', 'Textos')}</section>}
      {sub === 'weather' && (
        <section className="space-y-4">
          <SectionTitle title="Tiempo y mar" hint="Temperatura y estado del mar son datos automáticos." />
          <Card className="space-y-4">
            <Toggle checked={s.weather_enabled !== false && s.weather_enabled !== 'false'} onChange={(v) => set('weather_enabled', v)} label="Mostrar en la portada" />
            <div className="grid grid-cols-2 gap-3">
              {text('weather_lat', 'Latitud', { inputMode: 'decimal' })}
              {text('weather_lon', 'Longitud', { inputMode: 'decimal' })}
            </div>
          </Card>
          {textGroup('weather', 'Textos')}
        </section>
      )}

      {sub === 'brand' && (
        <section className="space-y-4">
          <SectionTitle title="Marca y redes" hint="El nombre y el logo salen en la barra, el pie y la barra móvil." />
          <Card className="space-y-4">
            {text('site_name', 'Nombre del sitio')}
            {imageField('site_logo_url', 'Logo', 'Cuadrado, se muestra en círculo. Sin logo se usan las iniciales.', true)}
          </Card>
          <Card className="space-y-4">
            {text('social_instagram', 'Instagram', { placeholder: 'https://instagram.com/tu_casa', type: 'url', inputMode: 'url' })}
            {text('social_facebook', 'Facebook', { placeholder: 'https://facebook.com/tu_casa', type: 'url', inputMode: 'url' })}
            {text('social_tiktok', 'TikTok', { placeholder: 'https://tiktok.com/@tu_casa', type: 'url', inputMode: 'url' })}
            {text('social_youtube', 'YouTube', { placeholder: 'https://youtube.com/@tu_casa', type: 'url', inputMode: 'url' })}
            <p className="text-xs text-emerald-200/50">Solo salen en el pie de página los que rellenes.</p>
          </Card>
        </section>
      )}

      {sub === 'sections' && (
        <section className="space-y-4">
          <SectionTitle title="Secciones de la web" hint="Muestra, oculta y ordena. La portada siempre va primero." />
          <div className="space-y-2.5">
            {order.map((id, i) => {
              const def = SECTION_DEFS.find((d) => d.id === id)!;
              const visible = !hidden.includes(id);
              return (
                <Card key={id} className="flex items-center gap-2 !py-2.5">
                  <div className="flex-1 min-w-0">
                    <Toggle checked={visible} onChange={(v) => toggleSection(id, v)} label={def.label} hint={visible ? 'Visible' : 'Oculta'} />
                  </div>
                  <button aria-label="Subir" disabled={i === 0} onClick={() => moveSection(i, -1)} className="w-11 h-11 rounded-lg text-emerald-200 disabled:opacity-25 hover:bg-emerald-800/60 flex items-center justify-center cursor-pointer"><ArrowUp className="w-4 h-4" /></button>
                  <button aria-label="Bajar" disabled={i === order.length - 1} onClick={() => moveSection(i, 1)} className="w-11 h-11 rounded-lg text-emerald-200 disabled:opacity-25 hover:bg-emerald-800/60 flex items-center justify-center cursor-pointer"><ArrowDown className="w-4 h-4" /></button>
                </Card>
              );
            })}
          </div>
          <p className="text-xs text-emerald-200/50">Si ocultas el calendario, los visitantes no podrán reservar desde la web.</p>
        </section>
      )}

      {sub === 'share' && (
        <section className="space-y-4">
          <SectionTitle title="Google y WhatsApp" hint="Lo que se ve al buscar la casa en Google o al compartir el enlace." />
          <Card className="space-y-4">
            {text('seo_title', 'Título', { hint: 'Hasta 60 caracteres.' })}
            {text('seo_description', 'Descripción', { multiline: true, rows: 3, hint: 'Hasta 160 caracteres.' })}
            {imageField('seo_image', 'Imagen al compartir', 'Mejor horizontal, 1200 × 630.')}
          </Card>
          <p className="text-xs text-emerald-200/50">Google y WhatsApp guardan una copia: los cambios pueden tardar en verse al compartir.</p>
        </section>
      )}

      {sub === 'footer' && (
        <section className="space-y-4">
          <SectionTitle title="Pie de página" />
          <Card className="space-y-4">
            {text('footer_tagline', 'Línea bajo el nombre')}
            {text('footer_description', 'Descripción', { multiline: true, rows: 4 })}
            <p className="text-xs text-emerald-200/50">Teléfono, correo y dirección se editan en Más → Contacto.</p>
          </Card>
          {textGroup('footer')}
        </section>
      )}
    </div>
  );
};
