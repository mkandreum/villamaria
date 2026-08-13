import React from 'react';
import { MapPin, Navigation, Compass, ExternalLink, Anchor, ShieldCheck, Car, Clock } from 'lucide-react';
import { PROPERTY_INFO } from '../data/mockData';

interface LocationSectionProps {
  address?: string;
  description?: string;
  mapsLink?: string;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  address = PROPERTY_INFO.locationName,
  description = 'Urbanización privada tranquila y segura a 5 minutos del embarcadero hacia los cayos.',
  mapsLink = PROPERTY_INFO.googleMapsUrl,
}) => {
  return (
    <section id="location" className="py-10 sm:py-20 bg-emerald-950 text-emerald-100 relative border-b border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-xs font-sans uppercase tracking-[0.2em] font-bold mb-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ubicación Exacta</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif text-white tracking-tight">
            Ubicación & Entorno
          </h2>
          <p className="text-emerald-300/70 text-xs sm:text-sm mt-1 font-sans">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center font-sans">
          {/* Info Details */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <div className="bg-emerald-900/40 border border-emerald-500/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-4 shadow-md">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-serif italic text-white">Dirección</h3>
                  <p className="text-xs text-emerald-200/90 mt-0.5 leading-snug">
                    {address}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-500/10 space-y-2">
                <div className="flex items-center gap-2.5 text-xs text-emerald-200/80">
                  <Anchor className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>5 min</strong> de embarcaderos principales</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-emerald-200/80">
                  <Car className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>Acceso pavimentado con portón de seguridad</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-emerald-200/80">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Recinto cerrado con vigilancia</span>
                </div>
              </div>

              {/* Direct Click Google Maps Link Button */}
              <div className="pt-1">
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-emerald-950 font-bold py-3 sm:py-4 px-4 rounded-xl text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-md hover:from-emerald-400 hover:to-teal-400 transition-all min-h-[44px]"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Abrir en Google Maps GPS</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </div>
            </div>

            {/* Travel Time Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 sm:p-4 bg-emerald-900/40 rounded-2xl border border-emerald-500/20 text-left">
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-400 font-bold mb-0.5">
                  <Clock className="w-3 h-3" />
                  <span>Embarcadero</span>
                </div>
                <p className="text-sm sm:text-base font-serif italic text-white">5 minutos</p>
                <p className="text-[10px] text-emerald-300/60">En vehículo</p>
              </div>

              <div className="p-3 sm:p-4 bg-emerald-900/40 rounded-2xl border border-emerald-500/20 text-left">
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-300 font-bold mb-0.5">
                  <Compass className="w-3 h-3" />
                  <span>Comercios</span>
                </div>
                <p className="text-sm sm:text-base font-serif italic text-white">3 minutos</p>
                <p className="text-[10px] text-emerald-300/60">Zonas de servicios</p>
              </div>
            </div>
          </div>

          {/* Map Preview Representation */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-emerald-500/20 bg-emerald-900/40 shadow-md">
              <div className="relative h-64 sm:h-96 w-full bg-emerald-950 overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#059669_1px,transparent_1px),linear-gradient(to_bottom,#059669_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />

                <div className="relative z-10 text-center space-y-2.5 p-4 sm:p-6 max-w-sm sm:max-w-md bg-emerald-900/80 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-emerald-500/30 shadow-xl">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 mx-auto rounded-full bg-emerald-500/20 p-1 shadow-md border border-emerald-500/40 flex items-center justify-center">
                    <MapPin className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-400" />
                  </div>

                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Ubicación de la Propiedad
                    </span>
                    <h4 className="text-sm sm:text-lg font-serif italic text-white mt-0.5">
                      Villa María
                    </h4>
                    <p className="text-[11px] text-emerald-300/70 mt-0.5">
                      {address}
                    </p>
                  </div>

                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-emerald-950 font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-colors shadow-md min-h-[44px]"
                  >
                    <span>Ver mapa GPS</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="bg-emerald-950 px-4 py-2.5 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-300/80 font-sans">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Zona Privada Residencial
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
