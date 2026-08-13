import React from 'react';
import { NEARBY_ATTRACTIONS } from '../data/mockData';
import { Anchor, Clock, ExternalLink, Compass } from 'lucide-react';

export const AttractionsSection: React.FC = () => {
  return (
    <section id="cayos" className="py-10 sm:py-20 bg-[#F8F5F0] text-[#1B3B36] relative border-b border-[#1B3B36]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C17D5C]/15 border border-[#C17D5C]/30 text-[#C17D5C] text-[10px] sm:text-xs font-sans uppercase tracking-[0.2em] font-bold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Parque Nacional Morrocoy</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif text-[#1B3B36] tracking-tight">
            Cayos Cercanos
          </h2>
          <p className="text-[#1B3B36]/70 text-xs sm:text-sm mt-1 font-sans">
            Playas de aguas turquesas a minutos saliendo desde los embarcaderos de Chichiriviche.
          </p>
        </div>

        {/* Mobile Horizontal Scroll-Snap / Desktop Grid */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none no-scrollbar font-sans">
          {NEARBY_ATTRACTIONS.map((item) => (
            <div
              key={item.id}
              className="min-w-[260px] sm:min-w-0 w-[82vw] sm:w-auto snap-center bg-white border border-[#1B3B36]/15 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all shrink-0 sm:shrink flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-[#EAE3D8]">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B3B36]/60 via-transparent to-transparent" />
                  
                  <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider bg-[#1B3B36] text-[#F8F5F0] px-2.5 py-0.5 rounded-full border border-white/20">
                    {item.tag}
                  </span>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-base font-serif italic text-white">{item.name}</h3>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#C17D5C]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.travelTime}</span>
                  </div>
                  <p className="text-xs text-[#1B3B36]/80 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Map query button */}
              <div className="p-4 pt-0">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    item.locationQuery
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-[#EAE3D8] hover:bg-[#1B3B36] hover:text-white text-[#1B3B36] text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Anchor className="w-3.5 h-3.5 text-[#C17D5C]" />
                  <span>Ver en Mapa</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
                </a>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-center text-[#1B3B36]/50 sm:hidden font-sans mt-1">
          ← Desliza para explorar todos los cayos →
        </p>
      </div>
    </section>
  );
};
