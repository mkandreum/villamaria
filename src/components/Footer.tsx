import React from 'react';
import { Palmtree, MapPin, Phone, Mail, Navigation, Heart, ExternalLink } from 'lucide-react';
import { PROPERTY_INFO } from '../data/mockData';

interface FooterProps {
  address?: string;
  phone?: string;
  email?: string;
  mapsLink?: string;
}

export const Footer: React.FC<FooterProps> = ({
  address = PROPERTY_INFO.locationName,
  phone = PROPERTY_INFO.formattedPhone,
  email = PROPERTY_INFO.email,
  mapsLink = PROPERTY_INFO.googleMapsUrl,
}) => {
  return (
    <footer className="bg-emerald-950 text-emerald-100 py-16 font-sans border-t border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-emerald-500/20">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-emerald-950 shadow-md">
                <Palmtree className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-white block">
                  Villa María
                </span>
                <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                  Alojamiento Turístico & Relax
                </span>
              </div>
            </div>

            <p className="text-xs text-emerald-300/80 leading-relaxed max-w-sm font-sans">
              Disfruta de las mejores vacaciones en una villa de ensueño totalmente equipada.
            </p>

            <div className="pt-2">
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-900/60 border border-emerald-500/30 text-emerald-200 hover:bg-emerald-800 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm min-h-[44px]"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ver en Google Maps</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </div>

          {/* Direct Links */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em]">
              Navegación
            </h4>
            <ul className="space-y-2 text-emerald-300/80">
              <li>
                <a href="#disponibilidad" className="hover:text-emerald-400 transition-colors">
                  Calendario de Disponibilidad
                </a>
              </li>
              <li>
                <a href="#galeria" className="hover:text-emerald-400 transition-colors">
                  Galería de Fotos & Piscina
                </a>
              </li>
              <li>
                <a href="#amenities" className="hover:text-emerald-400 transition-colors">
                  Comodidades e Instalaciones
                </a>
              </li>
              <li>
                <a href="#location" className="hover:text-emerald-400 transition-colors">
                  Ubicación & Mapa
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-emerald-400 transition-colors">
                  Reseñas de Huéspedes
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-emerald-400 transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4 space-y-3 text-xs">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em]">
              Contacto Directo
            </h4>
            <div className="space-y-2.5 text-emerald-300/80">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${phone}`} className="hover:underline">
                  {phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`mailto:${email}`} className="hover:underline">
                  {email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-emerald-400/60 gap-3 font-sans">
          <p>© {new Date().getFullYear()} Villa María. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Diseñado con <Heart className="w-3 h-3 text-emerald-400 fill-emerald-400" /> para vacaciones inolvidables.
          </p>
        </div>
      </div>
    </footer>
  );
};
