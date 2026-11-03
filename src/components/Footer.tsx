import React from 'react';
import { Palmtree, MapPin, Phone, Mail, Navigation, Heart, ExternalLink, Instagram, Facebook, Youtube, Music2 } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { PROPERTY_INFO } from '../data/mockData';

interface FooterProps {
  address?: string;
  phone?: string;
  email?: string;
  mapsLink?: string;
  description?: string;
  tagline?: string;
}

export const Footer: React.FC<FooterProps> = ({
  address = PROPERTY_INFO.locationName,
  phone = PROPERTY_INFO.formattedPhone,
  email = PROPERTY_INFO.email,
  mapsLink = PROPERTY_INFO.googleMapsUrl,
  description = 'Disfruta de las mejores vacaciones en el Estado Falcón. Urbanización privada con piscina climatizada, agua constante 24/7 y planta eléctrica.',
  tagline = 'Alojamiento Turístico & Relax • Chichiriviche',
}) => {
  const site = useSite();
  const socials = [
    { key: 'instagram', label: 'Instagram', Icon: Instagram },
    { key: 'facebook', label: 'Facebook', Icon: Facebook },
    { key: 'tiktok', label: 'TikTok', Icon: Music2 },
    { key: 'youtube', label: 'YouTube', Icon: Youtube },
  ].filter((x) => (site.social as any)[x.key]);
  const links = [
    { id: 'disponibilidad', label: 'Calendario de Disponibilidad' },
    { id: 'gallery', label: 'Galería de Fotos' },
    { id: 'amenities', label: 'Comodidades e Instalaciones' },
    { id: 'location', label: 'Ubicación & Mapa' },
    { id: 'attractions', label: 'Cayos & Playas Cercanas' },
    { id: 'reviews', label: 'Opiniones de Huéspedes' },
    { id: 'faq', label: 'Preguntas Frecuentes' },
  ].filter((l) => !site.hidden.includes(l.id));
  return (
    <footer className="bg-[#1c1c1c] text-[#efeeea] py-10 sm:py-16 pb-24 md:pb-16 font-sans border-t border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 sm:pb-12 border-b border-[#efeeea]/15">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              {site.logoUrl ? (
                <img src={site.logoUrl} alt="" className="w-10 h-10 rounded-2xl object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-emerald-400 flex items-center justify-center text-emerald-950 shrink-0">
                  <Palmtree className="w-5 h-5" />
                </div>
              )}
              <div>
                <span className="font-serif text-2xl font-bold text-white block">
                  {site.siteName}
                </span>
                <span className="text-xs text-emerald-400 font-semibold block">
                  {tagline}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#e1dfd8] leading-relaxed max-w-sm font-sans">
              {description}
            </p>

            <div className="pt-2">
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#1c1c1c] hover:bg-[#e1dfd8] text-xs font-bold transition  min-h-[44px] active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                <span>Ver en Google Maps</span>
                <ExternalLink className="w-3 h-3 ml-0.5 text-emerald-700" />
              </a>
            </div>

            {socials.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                {socials.map(({ key, label, Icon }) => (
                  <a
                    key={key}
                    href={(site.social as any)[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Direct Links */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <h4 className="text-xs font-bold text-white ">
              Navegación
            </h4>
            <ul className="space-y-2 text-[#e1dfd8]">
              {links.map((l) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} className="hover:text-emerald-300 hover:translate-x-1 transition duration-300 py-1 inline-block min-h-[32px]">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4 space-y-3 text-xs">
            <h4 className="text-xs font-bold text-white ">
              Contacto Directo
            </h4>
            <div className="space-y-3 text-[#e1dfd8]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${phone}`} className="hover:underline py-1">
                  {phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`mailto:${email}`} className="hover:underline py-1">
                  {email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between text-[13px] text-[#e1dfd8]/70 gap-2.5 font-sans text-center sm:text-left">
          <p>© {new Date().getFullYear()} {site.siteName}. Todos los derechos reservados.</p>
          <p className="flex items-center justify-center gap-1">
            Diseñado con <Heart className="w-3 h-3 text-red-400 fill-red-400" /> para vacaciones inolvidables.
          </p>
        </div>
      </div>
    </footer>
  );
};
