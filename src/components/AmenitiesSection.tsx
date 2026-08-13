import React from 'react';
import { AMENITIES } from '../data/mockData';
import {
  Waves,
  Zap,
  Wind,
  Flame,
  ShieldCheck,
  Wifi,
  Car,
  Utensils,
  Tv,
  Compass,
  Sparkles,
  CheckCircle2,
  AirVent,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Waves,
  Zap,
  Wind,
  Flame,
  ShieldCheck,
  Wifi,
  Car,
  Utensils,
  Tv,
  Compass,
  AirVent,
};

interface AmenitiesSectionProps {
  amenities?: any;
}

export const AmenitiesSection: React.FC<AmenitiesSectionProps> = ({ amenities }) => {
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
      id: item.id || `amenity-${idx}`,
      title: item.name || item.title || 'Servicio',
      description: item.description || '',
      iconName: item.icon || item.iconName || 'CheckCircle2',
      highlighted: idx < 3,
    }));
  }, [amenities]);

  return (
    <section id="amenities" className="py-10 sm:py-20 bg-emerald-950/90 text-emerald-100 relative border-b border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-xs font-sans uppercase tracking-[0.2em] font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Servicios de la Propiedad</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif text-white tracking-tight">
            Comodidades Incluidas
          </h2>
          <p className="text-emerald-300/70 text-xs sm:text-sm mt-1 font-sans">
            Instalaciones preparadas para tu máximo confort durante la estancia.
          </p>
        </div>

        {/* Highlighted Amenities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 font-sans">
          {normalizedAmenities.map((item: any) => {
            const IconComponent = iconMap[item.iconName] || CheckCircle2;
            return (
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-2xl bg-emerald-900/40 border border-emerald-500/20 shadow-md hover:border-emerald-500/40 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-serif italic text-white">{item.title}</h3>
                    </div>
                    <p className="text-xs text-emerald-300/70 mt-1 leading-normal font-sans">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
