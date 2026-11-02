import { Stagger, StaggerItem } from './Reveal';
import { Clock } from 'lucide-react';
import { stripEmoji } from '../utils/icons';
import { SectionHeader } from './SectionHeader';
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
    <section className="py-16 sm:py-24 bg-[#EAE3D8]/40 text-[#1B3B36] relative font-sans border-b border-[#1B3B36]/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        <SectionHeader title="Cayos & Playas Cercanas" subtitle="Descubre los mejores cayos de aguas turquesas a solo minutos de la villa." />

        {/* Grid */}
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {normalizedAttractions.map((cayo: any) => (
            <StaggerItem key={cayo.id} className="h-full">
            <div
              className="bg-white h-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#1B3B36]/10 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-40 sm:h-44 overflow-hidden">
                <img
                  src={cayo.imageUrl}
                  alt={cayo.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
                <span className="absolute bottom-2.5 left-2.5 bg-emerald-950/85 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {stripEmoji(String(cayo.duration))}
                </span>
              </div>

              <div className="p-4 sm:p-5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#1B3B36]">{cayo.title}</h3>
                  <p className="text-xs text-[#1B3B36]/70 leading-relaxed font-sans mt-1">{cayo.description}</p>
                </div>

                <div className="pt-3 border-t border-[#1B3B36]/10 flex items-center gap-1.5 text-[11px] sm:text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  <Navigation className="w-3.5 h-3.5 shrink-0" />
                  <span>Acceso en embarcación</span>
                </div>
              </div>
            </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
};
