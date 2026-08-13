import React from 'react';
import { NEARBY_ATTRACTIONS } from '../data/mockData';
import { Compass, Waves, Navigation } from 'lucide-react';

interface AttractionsSectionProps {
  attractions?: any;
}

export const AttractionsSection: React.FC<AttractionsSectionProps> = ({ attractions }) => {
  const normalizedAttractions = React.useMemo(() => {
    if (!attractions) return NEARBY_ATTRACTIONS;
    let list = attractions;
    if (typeof attractions === 'string') {
      try {
        list = JSON.parse(attractions);
      } catch {
        list = [];
      }
    }
    if (!Array.isArray(list) || list.length === 0) return NEARBY_ATTRACTIONS;

    return list.map((item, idx) => ({
      id: item.id || `att-${idx}`,
      title: item.title || item.name || `Cayo ${idx + 1}`,
      duration: item.duration || '10 min en peñero',
      description: item.description || 'Aguas cristalinas y arena blanca en Morrocoy.',
      imageUrl: item.imageUrl || item.url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    }));
  }, [attractions]);

  return (
    <section id="attractions" className="py-12 sm:py-20 bg-[#EAE3D8]/40 text-[#1B3B36] relative font-sans border-b border-[#1B3B36]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-900/10 border border-emerald-800/20 text-emerald-900 text-xs font-bold font-sans uppercase tracking-wider mb-2">
            <span>🚤 Parque Nacional Morrocoy</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#1B3B36] font-bold tracking-tight">
            Cayos & Playas Cercanas 🏖️
          </h2>
          <p className="text-[#1B3B36]/70 text-xs sm:text-sm mt-2">
            Descubre los mejores cayos de aguas turquesas a solo minutos de la villa.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {normalizedAttractions.map((cayo: any) => (
            <div
              key={cayo.id}
              className="bg-white rounded-3xl overflow-hidden border border-[#1B3B36]/10 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={cayo.imageUrl}
                  alt={cayo.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-3 left-3 bg-emerald-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span>⏱️</span> {cayo.duration}
                </span>
              </div>

              <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#1B3B36]">{cayo.title} 🏝️</h3>
                  <p className="text-xs text-[#1B3B36]/70 leading-relaxed font-sans mt-1">{cayo.description}</p>
                </div>

                <div className="pt-3 border-t border-[#1B3B36]/10 flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Acceso directo en embarcación</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
