import { SectionHeader } from './SectionHeader';
import React, { useState } from 'react';
import { GALLERY_IMAGES } from '../data/mockData';
import { Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

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
      title: item.title || `Vista de la propiedad ${idx + 1}`,
      category: item.category || 'exteriores',
    }));
  }, [images]);

  const [activeCategory, setActiveCategory] = useState('todas');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = [
    { id: 'todas', label: cat1Label },
    { id: 'fachada', label: cat2Label },
    { id: 'piscina', label: cat3Label },
    { id: 'interiores', label: cat4Label },
  ];

  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const touchStartX = React.useRef<number | null>(null);

  const filteredImages = activeCategory === 'todas'
    ? normalizedImages
    : normalizedImages.filter(img => img.category.toLowerCase().includes(activeCategory.toLowerCase()));

  const step = (delta: number) =>
    setLightboxIndex((prev) => (prev === null ? prev : (prev + delta + filteredImages.length) % filteredImages.length));

  React.useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [lightboxIndex === null, filteredImages.length]);

  return (
    <section id="gallery" className="py-16 sm:py-24 bg-[#F8F5F0] text-[#1B3B36] relative font-sans border-b border-[#1B3B36]/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        <SectionHeader title={title} subtitle={subtitle}>

          {/* Categories */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5 sm:mt-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-2xl text-xs font-bold transition-all min-h-[44px] cursor-pointer flex items-center justify-center ${
                  activeCategory === cat.id
                    ? 'bg-[#1B3B36] text-white shadow-md'
                    : 'bg-white text-[#1B3B36]/80 border border-[#1B3B36]/10 hover:bg-[#EAE3D8] active:scale-95'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </SectionHeader>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
          {filteredImages.map((img: any, idx: number) => (
            <button
              type="button"
              key={img.id || idx}
              onClick={() => setLightboxIndex(idx)}
              aria-label={`Ampliar: ${img.title}`}
              className={`group relative text-left rounded-2xl sm:rounded-3xl overflow-hidden shadow-md sm:shadow-lg border-2 border-white bg-white cursor-pointer hover:-translate-y-1.5 transition-all duration-300 active:scale-[0.97] ${
                idx % 5 === 0 ? 'col-span-2 lg:col-span-1' : ''
              }`}
            >
              <motion.div layoutId={`gallery-${img.id || idx}`} className={`overflow-hidden ${idx % 5 === 0 ? 'aspect-[16/10] lg:aspect-[4/3]' : 'aspect-square sm:aspect-[4/3]'} ${loaded[img.url] ? '' : 'shimmer-badge'}`}>
                <img
                  src={img.url}
                  alt={img.title}
                  loading="lazy"
                  decoding="async"
                  onLoad={() => setLoaded((m) => ({ ...m, [img.url]: true }))}
                  className={`w-full h-full object-cover group-hover:scale-110 transition-[transform,opacity] duration-700 ${loaded[img.url] ? 'opacity-100' : 'opacity-0'}`}
                />
              </motion.div>

              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5 sm:p-4 text-white">
                <span className="text-xs font-serif font-bold text-white block truncate">{img.title}</span>
                <span className="text-[11px] text-emerald-300 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ampliar foto</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredImages[lightboxIndex] && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Visor de fotos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-md flex flex-col"
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              touchStartX.current = null;
              if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            }}
          >
            <div className="flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),12px)] pb-2 text-white">
              <span className="text-sm font-bold tabular-nums">{lightboxIndex + 1} / {filteredImages.length}</span>
              <button
                onClick={() => setLightboxIndex(null)}
                className="p-2.5 rounded-full bg-white/15 hover:bg-white/30 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative flex-1 min-h-0 flex items-center justify-center px-2 sm:px-16">
              <button
                onClick={() => step(-1)}
                className="hidden sm:flex absolute left-4 p-3 rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors min-w-[48px] min-h-[48px] items-center justify-center cursor-pointer"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={filteredImages[lightboxIndex].url}
                  layoutId={`gallery-${filteredImages[lightboxIndex].id || lightboxIndex}`}
                  src={filteredImages[lightboxIndex].url}
                  alt={filteredImages[lightboxIndex].title}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="max-h-full max-w-full object-contain rounded-xl select-none"
                  draggable={false}
                />
              </AnimatePresence>
              <button
                onClick={() => step(1)}
                className="hidden sm:flex absolute right-4 p-3 rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors min-w-[48px] min-h-[48px] items-center justify-center cursor-pointer"
                aria-label="Foto siguiente"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <p className="text-center text-white font-serif font-bold text-sm px-4 pt-2">{filteredImages[lightboxIndex].title}</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)] justify-start sm:justify-center">
              {filteredImages.map((img: any, i: number) => (
                <button
                  key={img.id || i}
                  onClick={() => setLightboxIndex(i)}
                  aria-label={`Ir a foto ${i + 1}`}
                  className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    i === lightboxIndex ? 'border-emerald-400 opacity-100 scale-105' : 'border-transparent opacity-50'
                  }`}
                >
                  <img src={img.url} alt="" loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
