import React from 'react';
import { NEARBY_ATTRACTIONS } from '../data/mockData';
import { Anchor, Clock, ExternalLink, Compass } from 'lucide-react';

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
      id: item.id || `attr-${idx}`,
      name: item.title || item.name || 'Cayo Morrocoy',
      tag: item.subtitle || item.tag || 'Cayo',
      travelTime: item.time || item.travelTime || '10 min',
      description: item.description || '',
      imageUrl: item.imageUrl || NEARBY_ATTRACTIONS[idx % NEARBY_ATTRACTIONS.length]?.imageUrl,
      locationQuery: item.title || item.name || 'Parque Nacional Morrocoy',
    }));
  }, [attractions]);

  return (
    <section id="cayos" className="py-10 sm:py-20 bg-emerald-950/90 text-emerald-100 relative border-b border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-xs font-sans uppercase tracking-[0.2em] font-bold mb-2">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Entorno & Naturaleza</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif text-white tracking-tight">
            Puntos de Interés & Cayos
          </h2>
          <p className="text-emerald-300/70 text-xs sm:text-sm mt-1 font-sans">
            Atracciones y lugares destacados cercanos a la propiedad.
          </p>
        </div>

        {/* Attractions Grid */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none no-scrollbar font-sans">
          {normalizedAttractions.map((item: any) => (
            <div
              key={item.id}
              className="min-w-[260px] sm:min-w-0 w-[82vw] sm:w-auto snap-center bg-emerald-900/40 border border-emerald-500/20 rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all shrink-0 sm:shrink flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-emerald-950">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />

                  <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    {item.tag}
                  </span>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-base font-serif italic text-white">{item.name}</h3>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.travelTime}</span>
                  </div>
                  <p className="text-xs text-emerald-300/80 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Map query button */}
              <div className="p-4 pt-0">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    item.locationQuery || item.name
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-950 hover:bg-emerald-800 text-emerald-200 hover:text-white text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border border-emerald-500/30 min-h-[44px]"
                >
                  <Anchor className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ver en Mapa</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
