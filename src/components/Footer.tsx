import React from 'react';
import { Palmtree, MapPin, Phone, Mail, Navigation, Heart, ExternalLink } from 'lucide-react';
import { PROPERTY_INFO } from '../data/mockData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1B3B36] text-[#F8F5F0] py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-[#F8F5F0]/15">
          {/* Brand Info (5 Cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C17D5C] flex items-center justify-center text-white shadow-sm">
                <Palmtree className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-white block">
                  {PROPERTY_INFO.name}
                </span>
                <span className="text-xs text-[#C17D5C] font-semibold uppercase tracking-wider">
                  Casa de Playa en Chichiriviche (Calle 15)
                </span>
              </div>
            </div>

            <p className="text-xs text-[#EAE3D8] leading-relaxed max-w-sm font-sans">
              Disfruta de las mejores vacaciones en el Estado Falcón. Urbanización privada con piscina comunitaria, planta eléctrica, aire acondicionado y cercanía a los cayos de Morrocoy.
            </p>

            <div className="pt-2">
              <a
                href={PROPERTY_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F8F5F0] text-[#1B3B36] hover:bg-[#C17D5C] hover:text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                <Navigation className="w-3.5 h-3.5 text-[#C17D5C]" />
                <span>Ver en Google Maps (Calle 15)</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </div>

          {/* Direct Links (3 Cols) */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em]">
              Navegación
            </h4>
            <ul className="space-y-2 text-[#EAE3D8]">
              <li>
                <a href="#disponibilidad" className="hover:text-[#C17D5C] transition-colors">
                  Calendario de Disponibilidad
                </a>
              </li>
              <li>
                <a href="#galeria" className="hover:text-[#C17D5C] transition-colors">
                  Galería de Fotos & Piscina
                </a>
              </li>
              <li>
                <a href="#comodidades" className="hover:text-[#C17D5C] transition-colors">
                  Comodidades e Instalaciones
                </a>
              </li>
              <li>
                <a href="#ubicacion" className="hover:text-[#C17D5C] transition-colors">
                  Ubicación & Mapa en Chichiriviche
                </a>
              </li>
              <li>
                <a href="#opiniones" className="hover:text-[#C17D5C] transition-colors">
                  Reseñas de Huéspedes
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#C17D5C] transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Contact (4 Cols) */}
          <div className="md:col-span-4 space-y-3 text-xs">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em]">
              Contacto Directo
            </h4>
            <div className="space-y-2.5 text-[#EAE3D8]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C17D5C] shrink-0" />
                <span>{PROPERTY_INFO.locationName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C17D5C] shrink-0" />
                <a href={`tel:${PROPERTY_INFO.phoneWhatsApp}`} className="hover:underline">
                  {PROPERTY_INFO.formattedPhone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C17D5C] shrink-0" />
                <a href={`mailto:${PROPERTY_INFO.email}`} className="hover:underline">
                  {PROPERTY_INFO.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#EAE3D8]/70 gap-3 font-sans">
          <p>© {new Date().getFullYear()} Villa María - Chichiriviche. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Diseñado con <Heart className="w-3 h-3 text-[#C17D5C] fill-[#C17D5C]" /> para vacaciones inolvidables.
          </p>
        </div>
      </div>
    </footer>
  );
};
