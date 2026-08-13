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
    <footer className="bg-[#1B3B36] text-[#F8F5F0] py-16 font-sans border-t border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-[#F8F5F0]/15">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-emerald-950 shadow-md">
                <Palmtree className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-white block">
                  Villa María 🌴
                </span>
                <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                  Alojamiento Turístico & Relax • Chichiriviche
                </span>
              </div>
            </div>

            <p className="text-xs text-[#EAE3D8] leading-relaxed max-w-sm font-sans">
              Disfruta de las mejores vacaciones en el Estado Falcón. Urbanización privada con piscina climatizada, agua constante 24/7 y planta eléctrica. 🏖️
            </p>

            <div className="pt-2">
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#1B3B36] hover:bg-[#EAE3D8] text-xs font-bold uppercase tracking-wider transition-colors shadow-sm min-h-[44px]"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                <span>Ver en Google Maps 🗺️</span>
                <ExternalLink className="w-3 h-3 ml-0.5 text-emerald-700" />
              </a>
            </div>
          </div>

          {/* Direct Links */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em]">
              Navegación 🧭
            </h4>
            <ul className="space-y-2.5 text-[#EAE3D8]">
              <li>
                <a href="#disponibilidad" className="hover:text-emerald-400 transition-colors">
                  📅 Calendario de Disponibilidad
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-emerald-400 transition-colors">
                  📸 Galería de Fotos & Piscina
                </a>
              </li>
              <li>
                <a href="#amenities" className="hover:text-emerald-400 transition-colors">
                  ✨ Comodidades e Instalaciones
                </a>
              </li>
              <li>
                <a href="#location" className="hover:text-emerald-400 transition-colors">
                  📍 Ubicación & Mapa
                </a>
              </li>
              <li>
                <a href="#attractions" className="hover:text-emerald-400 transition-colors">
                  🚤 Cayos & Playas Cercanas
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-emerald-400 transition-colors">
                  💬 Opiniones de Huéspedes
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-emerald-400 transition-colors">
                  💡 Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4 space-y-3 text-xs">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em]">
              Contacto Directo 📞
            </h4>
            <div className="space-y-3 text-[#EAE3D8]">
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
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#EAE3D8]/70 gap-3 font-sans">
          <p>© {new Date().getFullYear()} Villa María. Todos los derechos reservados. 🌴</p>
          <p className="flex items-center gap-1">
            Diseñado con <Heart className="w-3 h-3 text-red-400 fill-red-400" /> para vacaciones inolvidables.
          </p>
        </div>
      </div>
    </footer>
  );
};
