import React, { useState } from 'react';
import { GALLERY_IMAGES } from '../data/mockData';
import { Maximize2, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface GallerySectionProps {
  images?: any;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ images }) => {
  const [activeCategory, setActiveCategory] = useState<string>('todas');
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  // Normalize images passed from DB (array of strings or array of objects)
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

    return list.map((item, idx) => {
      if (typeof item === 'string') {
        return {
          id: `img-${idx}`,
          title: `Vista de la propiedad ${idx + 1}`,
          category: 'exteriores',
          url: item,
          description: 'Foto oficial de Villa María',
        };
      }
      return item;
    });
  }, [images]);

  const categories = [
    { id: 'todas', label: 'Todas' },
    { id: 'exteriores', label: 'Fachada & Porche' },
    { id: 'piscina', label: 'Piscina' },
    { id: 'habitaciones', label: 'Habitaciones' },
  ];

  const filteredImages =
    activeCategory === 'todas'
      ? normalizedImages
      : normalizedImages.filter((img: any) => img.category === activeCategory);

  const openLightbox = (index: number) => {
    setActiveImageIndex(index);
  };

  const closeLightbox = () => {
    setActiveImageIndex(null);
  };

  const nextImage = () => {
    if (activeImageIndex === null) return;
    setActiveImageIndex((activeImageIndex + 1) % filteredImages.length);
  };

  const prevImage = () => {
    if (activeImageIndex === null) return;
    setActiveImageIndex((activeImageIndex - 1 + filteredImages.length) % filteredImages.length);
  };

  return (
    <section id="galeria" className="py-10 sm:py-20 bg-emerald-950 text-emerald-100 relative border-b border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-xs font-sans uppercase tracking-[0.2em] font-bold mb-2">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Recorrido Visual</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif text-white tracking-tight">
            Fotos de Villa María
          </h2>
          <p className="text-emerald-300/70 text-xs sm:text-sm mt-1 font-sans">
            Galería dinámica de la propiedad, jardines, piscina y estancias.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 sm:mb-8 font-sans scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider shrink-0 transition-all ${
                activeCategory === cat.id
                  ? 'bg-emerald-500 text-emerald-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-emerald-900/40 text-emerald-200 hover:bg-emerald-800 border border-emerald-500/30 font-medium'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none no-scrollbar font-sans">
          {filteredImages.map((img: any, idx: number) => (
            <div
              key={img.id || idx}
              onClick={() => openLightbox(idx)}
              className="group relative h-56 sm:h-64 min-w-[240px] sm:min-w-0 w-[78vw] sm:w-auto snap-center rounded-2xl sm:rounded-3xl overflow-hidden bg-emerald-900/40 border border-emerald-500/20 cursor-pointer shadow-md hover:shadow-xl transition-all shrink-0 sm:shrink"
            >
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-transparent opacity-80" />

              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 flex flex-col justify-end text-white">
                <span className="text-[9px] uppercase font-bold text-emerald-400 tracking-wider mb-0.5">
                  {img.category ? img.category.replace('_', ' ') : 'Villa María'}
                </span>
                <h3 className="text-xs sm:text-sm font-serif italic text-white leading-snug">
                  {img.title}
                </h3>
              </div>

              <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeImageIndex !== null && (
        <div className="fixed inset-0 z-50 bg-emerald-950/95 backdrop-blur-xl flex items-center justify-center p-4">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full bg-emerald-900 text-emerald-200 hover:bg-emerald-800 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-2 sm:left-8 p-2.5 rounded-full bg-emerald-900 text-emerald-200 hover:bg-emerald-800 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 sm:right-8 p-2.5 rounded-full bg-emerald-900 text-emerald-200 hover:bg-emerald-800 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="max-w-4xl w-full max-h-[85vh] flex flex-col items-center">
            <img
              src={filteredImages[activeImageIndex].url}
              alt={filteredImages[activeImageIndex].title}
              className="max-h-[65vh] w-auto object-contain rounded-2xl shadow-2xl border border-emerald-500/30"
            />
            <div className="mt-3 text-center max-w-xl text-emerald-100 font-sans px-4">
              <h3 className="text-base sm:text-xl font-serif italic text-white">
                {filteredImages[activeImageIndex].title}
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mt-2">
                Foto {activeImageIndex + 1} de {filteredImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
