import React, { createContext, useContext, useMemo } from 'react';

export const SECTION_DEFS = [
  { id: 'disponibilidad', label: 'Calendario de reservas', navId: 'booking' },
  { id: 'gallery', label: 'Galería de fotos', navId: 'gallery' },
  { id: 'amenities', label: 'Servicios', navId: 'amenities' },
  { id: 'location', label: 'Ubicación y mapa', navId: 'location' },
  { id: 'attractions', label: 'Atracciones cercanas', navId: 'attractions' },
  { id: 'faq', label: 'Normas y preguntas', navId: 'faq' },
  { id: 'reviews', label: 'Opiniones', navId: 'reviews' },
] as const;

export type SectionId = (typeof SECTION_DEFS)[number]['id'];

const parseList = (raw: any): string[] => {
  if (Array.isArray(raw)) return raw.map(String);
  try { const v = typeof raw === 'string' ? JSON.parse(raw) : []; return Array.isArray(v) ? v.map(String) : []; } catch { return []; }
};

/** Section ids in display order: the saved order first, then any section not saved yet. */
export const orderedSections = (rawOrder: any): SectionId[] => {
  const known = SECTION_DEFS.map((s) => s.id as string);
  const saved = parseList(rawOrder).filter((id) => known.includes(id));
  return [...saved, ...known.filter((id) => !saved.includes(id))] as SectionId[];
};

export const hiddenSections = (rawHidden: any): string[] => parseList(rawHidden);

export interface GalleryFilter { id: string; label: string }
// Photos with this category only appear under "Todas"
export const NO_FILTER = 'exteriores';

/** The gallery's filter buttons. Until the list is first edited, they come from the old three fixed labels. */
export const galleryFilters = (settings: Record<string, any>): GalleryFilter[] => {
  let saved = settings.gallery_filters;
  try { if (typeof saved === 'string') saved = JSON.parse(saved); } catch { saved = null; }
  if (Array.isArray(saved)) return saved.map((f: any) => ({ id: String(f.id), label: String(f.label ?? '') }));
  return [
    { id: 'fachada', label: String(settings.gallery_cat2 ?? '') },
    { id: 'piscina', label: String(settings.gallery_cat3 ?? '') },
    { id: 'interiores', label: String(settings.gallery_cat4 ?? '') },
  ].filter((f) => f.label.trim());
};

export const photoFilterId = (category: any, filters: GalleryFilter[]): string =>
  filters.find((f) => String(category || '').toLowerCase().includes(f.id))?.id ?? NO_FILTER;

export interface SiteInfo {
  siteName: string;
  logoUrl: string;
  social: { instagram: string; facebook: string; tiktok: string; youtube: string };
  hidden: string[];
  isVisible: (navOrSectionId: string) => boolean;
  /** The saved text for a key; empty when the admin left it empty. */
  t: (key: string) => string;
}

const defaults: SiteInfo = {
  siteName: '',
  logoUrl: '',
  social: { instagram: '', facebook: '', tiktok: '', youtube: '' },
  hidden: [],
  isVisible: () => true,
  t: () => '',
};

const Ctx = createContext<SiteInfo>(defaults);
export const useSite = () => useContext(Ctx);

export const SiteProvider: React.FC<{ settings: Record<string, any>; children: React.ReactNode }> = ({ settings, children }) => {
  const value = useMemo<SiteInfo>(() => {
    const hidden = hiddenSections(settings.sections_hidden);
    const hiddenAll = new Set(hidden);
    SECTION_DEFS.forEach((d) => { if (hiddenAll.has(d.id)) hiddenAll.add(d.navId); });
    return {
      siteName: String(settings.site_name ?? '').trim(),
      logoUrl: String(settings.site_logo_url || '').trim(),
      social: {
        instagram: String(settings.social_instagram || '').trim(),
        facebook: String(settings.social_facebook || '').trim(),
        tiktok: String(settings.social_tiktok || '').trim(),
        youtube: String(settings.social_youtube || '').trim(),
      },
      hidden,
      isVisible: (id) => !hiddenAll.has(id),
      t: (key) => String(settings[key] ?? ''),
    };
  }, [settings]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
