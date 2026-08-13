import React from 'react';
import { AMENITIES } from '../data/mockData';

interface AmenitiesSectionProps {
  amenities?: any;
  badge?: string;
  title?: string;
  subtitle?: string;
}

export const AmenitiesSection: React.FC<AmenitiesSectionProps> = ({
  amenities,
  badge = '✨ Servicios de la Propiedad',
  title = 'Comodidades Incluidas 🏡',
  subtitle = 'Instalaciones preparadas para tu máximo confort durante tus vacaciones en Chichiriviche.',
}) => {
  const normalizedAmenities = React.useMemo(() => {
    if (!amenities) return AMENITIES;
    let list = amenities;
    if (typeof amenities === 'string') {
      try {
        list = JSON.parse(amenities);
      } catch {
        list = [];
      }
    }
    if (!Array.isArray(list) || list.length === 0) return AMENITIES;

    return list.map((item, idx) => ({
      id: item.id || `am-${idx}`,
      title: item.title || item.name || item,
      description: item.description || 'Comodidad incluida para tu estancia.',
      emoji: item.emoji || '✨',
    }));
  }, [amenities]);

  const getEmojiForAmenity = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('wifi') || t.includes('internet')) return '📶';
    if (t.includes('piscina') || t.includes('pool')) return '🏊‍♂️';
    if (t.includes('aparcamiento') || t.includes('parking') || t.includes('garaje')) return '🚗';
    if (t.includes('aire') || t.includes('clima')) return '❄️';
    if (t.includes('barbacoa') || t.includes('parrilla')) return '🍖';
    if (t.includes('cocina')) return '🍳';
    if (t.includes('luz') || t.includes('planta')) return '⚡';
    if (t.includes('tv') || t.includes('smart')) return '📺';
    return '✨';
  };

  return (
    <section id="amenities" className="py-12 sm:py-20 bg-[#EAE3D8]/40 text-[#1B3B36] relative font-sans border-b border-[#1B3B36]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-900/10 border border-emerald-800/20 text-emerald-900 text-xs font-bold font-sans uppercase tracking-wider mb-2">
            <span>{badge}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#1B3B36] font-bold tracking-tight">
            {title}
          </h2>
          <p className="text-[#1B3B36]/70 text-xs sm:text-sm mt-2">
            {subtitle}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {normalizedAmenities.map((item: any, idx: number) => (
            <div
              key={item.id || idx}
              className="bg-white rounded-3xl p-6 border border-[#1B3B36]/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#EAE3D8] text-2xl flex items-center justify-center shrink-0 shadow-inner">
                {item.emoji || getEmojiForAmenity(item.title)}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-serif font-bold text-[#1B3B36]">{item.title}</h3>
                <p className="text-xs text-[#1B3B36]/70 leading-relaxed font-sans">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
