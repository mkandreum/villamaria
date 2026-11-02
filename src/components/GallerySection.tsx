import { SectionHeader } from './SectionHeader';
import React, { useState } from 'react';
import { GALLERY_IMAGES } from '../data/mockData';
import { Images } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { PhotoViewer } from './PhotoViewer';
import { stripEmoji } from '../utils/icons';

interface GallerySectionProps {
  images?: any;
  badge?: string;
  title?: string;
  subtitle?: string;
  cat1Label?: string;
  cat2Label?: string;
  cat3Label?: string;
  cat4Label?: string;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  images,
  badge = ' Recorrido Visual',
  title = 'Fotos de Villa María',
  subtitle = 'Galería dinámica de la propiedad, jardines, piscina climatizada y estancias.',
  cat1Label = 'Todas',
  cat2Label = 'Fachada & Porche',
  cat3Label = 'Piscina & Jardines',
  cat4Label = 'Habitaciones & Salón',
}) => {
  const normalizedImages = React.useMemo(() => {
    if (!images) return GALLERY_IMAGES;
    let list = images;
    if (typeof images === 'string') {
      try {
        list = JSON.parse(images);
      } catch {
        list = [];
      }
    }
    if (!Array.isArray(list) || list.length === 0) return GALLERY_IMAGES;

    return list.map((item, idx) => ({
      id: item.id || `img-${idx}`,
      url: typeof item === 'string' ? item : item.url || item.imageUrl,
      title: item.title || '',
      category: item.category || 'exteriores',
    }));
  }, [images]);

  const [activeCategory, setActiveCategory] = useState('todas');
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});

  const matches = (img: any, cat: string) => cat === 'todas' || String(img.category || '').toLowerCase().includes(cat);

  const categories = [
    { id: 'todas', label: cat1Label },
    { id: 'fachada', label: cat2Label },
    { id: 'piscina', label: cat3Label },
    { id: 'interiores', label: cat4Label },
  ]
    .map((c) => ({ ...c, label: stripEmoji(c.label), count: normalizedImages.filter((img) => matches(img, c.id)).length }))
    .filter((c) => c.id === 'todas' || c.count > 0);

  const filteredImages = normalizedImages.filter((img) => matches(img, activeCategory));
  const categoryLabel = (img: any) => categories.find((c) => c.id !== 'todas' && matches(img, c.id))?.label;
  const viewerPhotos = filteredImages.map((img: any) => ({ url: img.url, title: img.title, caption: categoryLabel(img) }));

  // Mosaic of up to seven tiles; the last one opens the rest of the collection
  const PREVIEW = 7;
  const visible = expanded ? filteredImages : filteredImages.slice(0, PREVIEW);
  const hidden = filteredImages.length - visible.length;

  const tileShape = (i: number) => {
    const pos = i % 7;
    if (pos === 0) return 'col-span-2 lg:col-span-2 lg:row-span-2 aspect-[16/10] lg:aspect-auto';
    if (pos === 3 || pos === 6) return 'col-span-2 lg:col-span-1 aspect-[16/9] lg:aspect-[4/3]';
    return 'aspect-square lg:aspect-[4/3]';
  };

  return (
    <section className="py-16 sm:py-24 bg-[#F8F5F0] text-[#1B3B36] relative font-sans border-b border-[#1B3B36]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title={stripEmoji(title)} subtitle={subtitle}>
          {categories.length > 1 && (
            <div className="no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 mt-6 flex gap-1.5 overflow-x-auto" role="tablist" aria-label="Filtrar fotos">
              {categories.map((cat) => {
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setExpanded(false);
                    }}
                    className={`relative shrink-0 px-4 min-h-[44px] rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                      active ? 'text-white' : 'text-[#1B3B36]/75 hover:text-[#1B3B36]'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="gallery-filter-pill"
                        className="absolute inset-0 rounded-full bg-[#1B3B36]"
                        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                      />
                    )}
                    <span className="relative flex items-center gap-1.5 whitespace-nowrap">
                      {cat.label}
                      <span className={`text-xs tabular-nums ${active ? 'text-white/70' : 'text-[#1B3B36]/50'}`}>{cat.count}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </SectionHeader>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 lg:grid-cols-4 lg:auto-rows-fr gap-2 sm:gap-3"
          >
            {visible.map((img: any, idx: number) => {
              const isLast = !expanded && idx === visible.length - 1 && hidden > 0;
              return (
                <button
                  type="button"
                  key={img.id || img.url || idx}
                  onClick={() => setViewerIndex(idx)}
                  aria-label={isLast ? `Ver las ${filteredImages.length} fotos` : `Ampliar foto ${idx + 1}${img.title ? `: ${img.title}` : ''}`}
                  className={`group relative overflow-hidden rounded-2xl bg-[#EAE3D8] cursor-zoom-in active:scale-[0.98] transition-transform duration-200 ${tileShape(idx)} ${
                    loaded[img.url] ? '' : 'animate-pulse'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.title || `Foto ${idx + 1} de Villa María`}
                    loading={idx < 3 ? 'eager' : 'lazy'}
                    decoding="async"
                    onLoad={() => setLoaded((m) => ({ ...m, [img.url]: true }))}
                    className={`absolute inset-0 w-full h-full object-cover transition-[transform,opacity] duration-700 ease-out group-hover:scale-105 ${
                      loaded[img.url] ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  {isLast && (
                    <span className="absolute inset-0 bg-emerald-950/60 text-white flex items-center justify-center gap-2 font-semibold">
                      <Images className="w-5 h-5" />+{hidden} fotos
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {filteredImages.length > PREVIEW && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="min-h-[48px] px-5 rounded-full border border-[#1B3B36]/25 text-[#1B3B36] text-sm font-semibold hover:bg-[#1B3B36]/5 active:scale-95 transition-transform cursor-pointer"
            >
              {expanded ? 'Ver menos' : `Ver las ${filteredImages.length} fotos`}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {viewerIndex !== null && (
          <PhotoViewer photos={viewerPhotos} startIndex={viewerIndex} onClose={() => setViewerIndex(null)} />
        )}
      </AnimatePresence>
    </section>
  );
};
