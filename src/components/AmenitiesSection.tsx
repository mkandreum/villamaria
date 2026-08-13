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
  CheckCircle2
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
};

export const AmenitiesSection: React.FC = () => {
  return (
    <section id="comodidades" className="py-10 sm:py-20 bg-[#F8F5F0] text-[#1B3B36] relative border-b border-[#1B3B36]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C17D5C]/15 border border-[#C17D5C]/30 text-[#C17D5C] text-[10px] sm:text-xs font-sans uppercase tracking-[0.2em] font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Todo Incluido</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif text-[#1B3B36] tracking-tight">
            Comodidades de la Casa
          </h2>
          <p className="text-[#1B3B36]/70 text-xs sm:text-sm mt-1 font-sans">
            Instalaciones preparadas para tu confort sin cortes de agua o electricidad.
          </p>
        </div>

        {/* Quick Specs Bar */}
        <div className="mb-8 bg-[#EAE3D8] border border-[#1B3B36]/15 rounded-2xl p-4 sm:p-6 font-sans">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-x-0 sm:divide-x divide-[#1B3B36]/10">
            <div className="p-1">
              <span className="block text-2xl sm:text-4xl font-serif italic text-[#C17D5C]">3</span>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#1B3B36]/70 mt-0.5 block font-bold">Habitaciones A/C</span>
            </div>
            <div className="p-1">
              <span className="block text-2xl sm:text-4xl font-serif italic text-[#1B3B36]">3</span>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#1B3B36]/70 mt-0.5 block font-bold">Baños Completos</span>
            </div>
            <div className="p-1">
              <span className="block text-2xl sm:text-4xl font-serif italic text-[#C17D5C]">12</span>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#1B3B36]/70 mt-0.5 block font-bold">Capacidad Máx</span>
            </div>
            <div className="p-1">
              <span className="block text-2xl sm:text-4xl font-serif italic text-[#1B3B36]">3</span>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#1B3B36]/70 mt-0.5 block font-bold">Estacionamiento</span>
            </div>
          </div>
        </div>

        {/* Highlighted Amenities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 font-sans">
          {AMENITIES.map((item) => {
            const IconComponent = iconMap[item.iconName] || CheckCircle2;
            return (
              <div
                key={item.id}
                className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all ${
                  item.highlighted
                    ? 'bg-white border-[#C17D5C]/40 shadow-sm'
                    : 'bg-[#EAE3D8]/50 border-[#1B3B36]/10'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#EAE3D8] border border-[#1B3B36]/10 flex items-center justify-center text-[#C17D5C] shrink-0">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-serif italic text-[#1B3B36]">{item.title}</h3>
                      {item.highlighted && (
                        <span className="text-[8px] sm:text-[9px] font-sans font-bold bg-[#C17D5C]/15 text-[#C17D5C] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#C17D5C]/30">
                          Top
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#1B3B36]/70 mt-1 leading-normal font-sans">
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
