import React, { useState } from 'react';
import { GALLERY_IMAGES } from '../data/mockData';
import { Maximize2, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

export const GallerySection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('todas');
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const categories = [
    { id: 'todas', label: 'Todas' },
    { id: 'exteriores', label: 'Fachada & Porche' },
    { id: 'piscina', label: 'Piscina' },
    { id: 'habitaciones', label: 'Habitaciones' },
    { id: 'sala_cocina', label: 'Sala/Cocina' },
    { id: 'entorno', label: 'Cayos' },
  ];

  const filteredImages =
    activeCategory === 'todas'
      ? GALLERY_IMAGES
      : GALLERY_IMAGES.filter((img) => img.category === activeCategory);

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
    <section id="galeria" className="py-10 sm:py-20 bg-[#EAE3D8] text-[#1B3B36] relative border-b border-[#1B3B36]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B3B36]/10 border border-[#1B3B36]/20 text-[#1B3B36] text-[10px] sm:text-xs font-sans uppercase tracking-[0.2em] font-bold mb-2">
            <ImageIcon className="w-3.5 h-3.5 text-[#C17D5C]" />
            <span>Recorrido Visual</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif text-[#1B3B36] tracking-tight">
            Fotos de Villa María
          </h2>
          <p className="text-[#1B3B36]/70 text-xs sm:text-sm mt-1 font-sans">
            Desliza para explorar la casa, la piscina comunitaria y los espacios.
          </p>
        </div>

        {/* Category Filters - Horizontal Scroll on Mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 sm:mb-8 font-sans scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider shrink-0 transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#1B3B36] text-[#F8F5F0] font-bold shadow-sm'
                  : 'bg-[#F8F5F0] text-[#1B3B36] hover:bg-[#C17D5C] hover:text-white border border-[#1B3B36]/15 font-medium'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Mobile: Touch-Friendly Scroll Snap Carousel | Desktop: Grid */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none no-scrollbar font-sans">
          {filteredImages.map((img, idx) => (
            <div
              key={img.id}
              onClick={() => openLightbox(idx)}
              className="group relative h-56 sm:h-64 min-w-[240px] sm:min-w-0 w-[78vw] sm:w-auto snap-center rounded-2xl sm:rounded-3xl overflow-hidden bg-[#F8F5F0] border border-[#1B3B36]/15 cursor-pointer shadow-sm hover:shadow-lg transition-all shrink-0 sm:shrink"
            >
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B3B36]/80 via-[#1B3B36]/20 to-transparent opacity-80" />

              {/* Title & Badge Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 flex flex-col justify-end text-white">
                <span className="text-[9px] uppercase font-bold text-[#EAE3D8] tracking-wider mb-0.5">
                  {img.category.replace('_', ' ')}
                </span>
                <h3 className="text-xs sm:text-sm font-serif italic text-white leading-snug">
                  {img.title}
                </h3>
              </div>

              {/* Expand Icon */}
              <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-[#1B3B36]/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-center text-[#1B3B36]/50 sm:hidden font-sans mt-1">
          ← Desliza para ver más fotos →
        </p>
      </div>

      {/* Lightbox Modal */}
      {activeImageIndex !== null && (
        <div className="fixed inset-0 z-50 bg-[#1B3B36]/95 backdrop-blur-xl flex items-center justify-center p-4">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#F8F5F0] text-[#1B3B36] hover:bg-[#C17D5C] hover:text-white transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Nav Buttons */}
          <button
            onClick={prevImage}
            className="absolute left-2 sm:left-8 p-2.5 rounded-full bg-[#F8F5F0] text-[#1B3B36] hover:bg-[#C17D5C] hover:text-white transition-colors"
            title="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 sm:right-8 p-2.5 rounded-full bg-[#F8F5F0] text-[#1B3B36] hover:bg-[#C17D5C] hover:text-white transition-colors"
            title="Siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Main Displayed Image */}
          <div className="max-w-4xl w-full max-h-[85vh] flex flex-col items-center">
            <img
              src={filteredImages[activeImageIndex].url}
              alt={filteredImages[activeImageIndex].title}
              className="max-h-[65vh] w-auto object-contain rounded-2xl shadow-2xl border border-white/20"
              referrerPolicy="no-referrer"
            />
            <div className="mt-3 text-center max-w-xl text-[#F8F5F0] font-sans px-4">
              <h3 className="text-base sm:text-xl font-serif italic text-white">
                {filteredImages[activeImageIndex].title}
              </h3>
              <p className="text-xs text-[#EAE3D8] mt-1 line-clamp-2 sm:line-clamp-none">
                {filteredImages[activeImageIndex].description}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-[#C17D5C] font-bold mt-2">
                Foto {activeImageIndex + 1} de {filteredImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
