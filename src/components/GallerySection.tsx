import React, { useState } from 'react';
import { GALLERY_IMAGES } from '../data/mockData';
import { Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';

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
  badge = '📸 Recorrido Visual',
  title = 'Fotos de Villa María 🌴',
  subtitle = 'Galería dinámica de la propiedad, jardines, piscina climatizada y estancias.',
  cat1Label = 'Todas 📸',
  cat2Label = 'Fachada & Porche 🏡',
  cat3Label = 'Piscina & Jardines 🏊‍♂️',
  cat4Label = 'Habitaciones & Salón 🛋️',
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

  const filteredImages = activeCategory === 'todas'
    ? normalizedImages
    : normalizedImages.filter(img => img.category.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <section id="gallery" className="py-10 sm:py-20 bg-[#F8F5F0] text-[#1B3B36] relative font-sans border-b border-[#1B3B36]/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-900/10 border border-emerald-800/20 text-emerald-900 text-xs font-bold font-sans uppercase tracking-wider mb-2">
            <span>{badge}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif text-[#1B3B36] font-bold tracking-tight">
            {title}
          </h2>
          <p className="text-[#1B3B36]/70 text-xs sm:text-sm mt-1.5 max-w-lg mx-auto">
            {subtitle}
          </p>

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
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
          {filteredImages.map((img: any, idx: number) => (
            <div
              key={img.id || idx}
              onClick={() => setLightboxIndex(idx)}
              className="group relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-md sm:shadow-lg border-2 border-white bg-white cursor-pointer hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5 sm:p-4 text-white">
                <span className="text-xs font-serif font-bold text-white block truncate">{img.title}</span>
                <span className="text-[10px] text-emerald-300 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ampliar foto</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-3 right-3 sm:top-5 sm:right-5 p-2.5 sm:p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors z-10 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={() => setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredImages.length - 1))}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors z-10 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            title="Foto anterior"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="max-w-4xl max-h-[85vh] relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={filteredImages[lightboxIndex].url}
              alt={filteredImages[lightboxIndex].title}
              className="max-h-[80vh] max-w-full object-contain mx-auto rounded-2xl sm:rounded-3xl"
            />
            <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-md p-3 sm:p-4 text-center text-white">
              <p className="font-serif font-bold text-xs sm:text-sm">{filteredImages[lightboxIndex].title}</p>
            </div>
          </div>

          <button
            onClick={() => setLightboxIndex((prev) => (prev !== null && prev < filteredImages.length - 1 ? prev + 1 : 0))}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors z-10 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            title="Foto siguiente"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      )}
    </section>
  );
};
