import React from 'react';
import { MapPin, Navigation, Compass, ExternalLink, Anchor, ShieldCheck, Car, Clock } from 'lucide-react';
import { PROPERTY_INFO } from '../data/mockData';

export const LocationSection: React.FC = () => {
  return (
    <section id="ubicacion" className="py-10 sm:py-20 bg-[#EAE3D8] text-[#1B3B36] relative border-b border-[#1B3B36]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B3B36]/10 border border-[#1B3B36]/20 text-[#1B3B36] text-[10px] sm:text-xs font-sans uppercase tracking-[0.2em] font-bold mb-2">
            <MapPin className="w-3.5 h-3.5 text-[#C17D5C]" />
            <span>Ubicación Exacta</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif text-[#1B3B36] tracking-tight">
            Chichiriviche • Calle 15 (c15)
          </h2>
          <p className="text-[#1B3B36]/70 text-xs sm:text-sm mt-1 font-sans">
            Urbanización privada tranquila y segura a 5 minutos del embarcadero hacia los cayos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center font-sans">
          {/* Info Details (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <div className="bg-[#F8F5F0] border border-[#1B3B36]/15 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#EAE3D8] text-[#C17D5C] flex items-center justify-center shrink-0 border border-[#1B3B36]/10">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-serif italic text-[#1B3B36]">Dirección</h3>
                  <p className="text-xs text-[#1B3B36]/80 mt-0.5 leading-snug">
                    {PROPERTY_INFO.locationName}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1B3B36]/10 space-y-2">
                <div className="flex items-center gap-2.5 text-xs text-[#1B3B36]/80">
                  <Anchor className="w-3.5 h-3.5 text-[#C17D5C] shrink-0" />
                  <span><strong>5 min</strong> de embarcaderos a Cayo Sombrero</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#1B3B36]/80">
                  <Car className="w-3.5 h-3.5 text-[#1B3B36] shrink-0" />
                  <span>Acceso pavimentado con portón de seguridad</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#1B3B36]/80">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C17D5C] shrink-0" />
                  <span>Conjunto residencial cerrado con vigilancia</span>
                </div>
              </div>

              {/* Direct Click Google Maps Link Button */}
              <div className="pt-1">
                <a
                  href={PROPERTY_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#1B3B36] hover:bg-[#C17D5C] text-[#F8F5F0] font-bold py-3 sm:py-4 px-4 rounded-xl text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Abrir en Google Maps GPS</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </div>
            </div>

            {/* Travel Time Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 sm:p-4 bg-[#F8F5F0] rounded-2xl border border-[#1B3B36]/15 text-left">
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#C17D5C] font-bold mb-0.5">
                  <Clock className="w-3 h-3" />
                  <span>Embarcadero</span>
                </div>
                <p className="text-sm sm:text-base font-serif italic text-[#1B3B36]">5 minutos</p>
                <p className="text-[10px] text-[#1B3B36]/60">En vehículo</p>
              </div>

              <div className="p-3 sm:p-4 bg-[#F8F5F0] rounded-2xl border border-[#1B3B36]/15 text-left">
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#1B3B36] font-bold mb-0.5">
                  <Compass className="w-3 h-3" />
                  <span>Comercios</span>
                </div>
                <p className="text-sm sm:text-base font-serif italic text-[#1B3B36]">3 minutos</p>
                <p className="text-[10px] text-[#1B3B36]/60">Bodegones y hielo</p>
              </div>
            </div>
          </div>

          {/* Map Preview Representation */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#1B3B36]/15 bg-[#F8F5F0] shadow-sm">
              <div className="relative h-64 sm:h-96 w-full bg-[#EAE3D8] overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#1B3B36_1px,transparent_1px),linear-gradient(to_bottom,#1B3B36_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />

                <div className="relative z-10 text-center space-y-2.5 p-4 sm:p-6 max-w-sm sm:max-w-md bg-[#F8F5F0] rounded-2xl sm:rounded-3xl border border-[#1B3B36]/15 shadow-md">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 mx-auto rounded-full bg-[#1B3B36] p-1 shadow-md">
                    <div className="w-full h-full bg-[#F8F5F0] rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 sm:w-7 sm:h-7 text-[#C17D5C]" />
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#C17D5C] uppercase tracking-wider block">
                      Pin de Ubicación
                    </span>
                    <h4 className="text-sm sm:text-lg font-serif italic text-[#1B3B36] mt-0.5">
                      Villa María - Calle 15 (c15)
                    </h4>
                    <p className="text-[11px] text-[#1B3B36]/70 mt-0.5">
                      Chichiriviche, Estado Falcón, Venezuela.
                    </p>
                  </div>

                  <a
                    href={PROPERTY_INFO.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B3B36] text-[#F8F5F0] font-bold text-xs uppercase tracking-wider hover:bg-[#C17D5C] transition-colors shadow-sm"
                  >
                    <span>Ver mapa GPS</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="bg-[#F8F5F0] px-4 py-2.5 border-t border-[#1B3B36]/15 flex items-center justify-between text-[11px] text-[#1B3B36]/80 font-sans">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C17D5C]" />
                  Sector C15 - Zona privada
                </span>
                <span className="text-[#1B3B36]/60">10.9317, -68.2736</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
