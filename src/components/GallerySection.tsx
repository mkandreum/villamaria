import React, { useState } from 'react';
import { GALLERY_IMAGES } from '../data/mockData';
import { Camera, Eye, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface GallerySectionProps {
  images?: any;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ images }) => {
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
      url: item.url || item.imageUrl || item,
      title: item.title || `Vista de la propiedad ${idx + 1}`,
      category: item.category || 'exteriores',
    }));
  }, [images]);

  const [activeCategory, setActiveCategory] = useState('todas');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = [
    { id: 'todas', label: 'Todas 📸' },
    { id: 'fachada', label: 'Fachada & Porche 🏡' },
    { id: 'piscina', label: 'Piscina & Jardines 🏊‍♂️' },
    { id: 'interiores', label: 'Habitaciones & Salón 🛋️' },
  ];

  const filteredImages = activeCategory === 'todas'
    ? normalizedImages
    : normalizedImages.filter(img => img.category.toLowerCase().includes(activeCategory));

  return (
    <section id="gallery" className="py-12 sm:py-20 bg-[#F8F5F0] text-[#1B3B36] relative font-sans border-b border-[#1B3B36]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-900/10 border border-emerald-800/20 text-emerald-900 text-xs font-bold font-sans uppercase tracking-wider mb-2">
            <span>📸 Recorrido Visual</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#1B3B36] font-bold tracking-tight">
            Fotos de Villa María 🌴
          </h2>
          <p className="text-[#1B3B36]/70 text-xs sm:text-sm mt-2">
            Galería dinámica de la propiedad, jardines, piscina climatizada y estancias.
          </p>

          {/* Categories */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all min-h-[40px] ${
                  activeCategory === cat.id
                    ? 'bg-[#1B3B36] text-white shadow-md'
                    : 'bg-white text-[#1B3B36]/80 border border-[#1B3B36]/10 hover:bg-[#EAE3D8]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredImages.map((img: any, idx: number) => (
            <div
              key={img.id || idx}
              onClick={() => setLightboxIndex(idx)}
              className="group relative rounded-3xl overflow-hidden shadow-lg border-2 border-white bg-white cursor-pointer hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                <span className="text-xs font-serif font-bold text-white block">{img.title}</span>
                <span className="text-[10px] text-emerald-300 uppercase tracking-wider flex items-center gap-1 mt-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ampliar foto</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {lightboxIndex !== null && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={() => setLightboxIndex((prev) => (prev! - 1 + filteredImages.length) % filteredImages.length)}
              className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img
              src={filteredImages[lightboxIndex].url}
              alt={filteredImages[lightboxIndex].title}
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
            />

            <button
              onClick={() => setLightboxIndex((prev) => (prev! + 1) % filteredImages.length)}
              className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
