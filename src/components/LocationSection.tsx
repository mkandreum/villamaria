import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { PROPERTY_INFO } from '../data/mockData';

interface LocationSectionProps {
  address?: string;
  description?: string;
  mapsLink?: string;
  bullet1?: string;
  bullet2?: string;
  bullet3?: string;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  address = PROPERTY_INFO.locationName,
  description = PROPERTY_INFO.locationDescription,
  mapsLink = PROPERTY_INFO.googleMapsUrl,
  bullet1 = '5 minutos de los embarcaderos a Cayo Sombrero',
  bullet2 = 'Condominio privado con vigilancia las 24 horas',
  bullet3 = 'Supermercados y servicios a 3 minutos',
}) => {
  return (
    <section id="location" className="py-12 sm:py-20 bg-[#F8F5F0] text-[#1B3B36] relative font-sans border-b border-[#1B3B36]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-900/10 border border-emerald-800/20 text-emerald-900 text-xs font-bold font-sans uppercase tracking-wider mb-2">
            <span>📍 Ubicación Privilegiada</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#1B3B36] font-bold tracking-tight">
            Chichiriviche • Calle 15 🌴
          </h2>
          <p className="text-[#1B3B36]/70 text-xs sm:text-sm mt-2">
            Urbanización privada segura con fácil acceso a los embarcaderos y al Parque Nacional Morrocoy.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Details Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#1B3B36]/10 shadow-lg space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>Dirección Exacta 🗺️</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#1B3B36]">{address}</h3>
              <p className="text-xs text-[#1B3B36]/80 leading-relaxed font-sans">{description}</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#1B3B36]/10">
              <div className="flex items-center gap-3 text-xs font-semibold text-[#1B3B36]">
                <span className="w-8 h-8 rounded-xl bg-[#EAE3D8] flex items-center justify-center text-sm">⛵</span>
                <span>{bullet1}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-[#1B3B36]">
                <span className="w-8 h-8 rounded-xl bg-[#EAE3D8] flex items-center justify-center text-sm">🔒</span>
                <span>{bullet2}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-[#1B3B36]">
                <span className="w-8 h-8 rounded-xl bg-[#EAE3D8] flex items-center justify-center text-sm">🛒</span>
                <span>{bullet3}</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#1B3B36] text-white hover:bg-emerald-900 text-xs font-bold uppercase tracking-wider transition-all shadow-md min-h-[44px]"
              >
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>Abrir en Google Maps GPS 🗺️</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          </div>

          {/* Map Preview iframe / visual container */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden shadow-xl border-4 border-white h-[350px] sm:h-[420px] relative bg-[#EAE3D8]">
            <iframe
              title="Ubicación Villa María"
              src="https://maps.google.com/maps?q=Chichiriviche,Venezuela&t=&z=14&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
