import { SectionHeader } from './SectionHeader';
import { PhotoReveal } from './Motion';
import { Reveal, Stagger, StaggerItem } from './Reveal';
import { iconForText, stripEmoji } from '../utils/icons';
import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { PROPERTY_INFO } from '../data/mockData';

interface LocationSectionProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  address?: string;
  description?: string;
  mapsLink?: string;
  embedUrl?: string;
  bullet1?: string;
  bullet2?: string;
  bullet3?: string;
}

/**
 * Resolves the embed URL to use in the iframe.
 *
 * Priority:
 *  1. If user pasted a full <iframe> tag  extract the src and use it directly.
 *  2. If the URL already is a proper google.com/maps/embed?pb=...  use it directly.
 *  3. Otherwise  fall back to OpenStreetMap (no API key required, no errors).
 *
 * NOTE: The old maps.google.com/maps?q=...&output=embed format now requires
 * a Google Maps Embed API key and shows "couldn't load custom map content"
 * without one. OpenStreetMap is a reliable, always-free alternative.
 */
function resolveEmbedUrl(raw: string | undefined): string {
  // Default OSM embed centered on Chichiriviche, Venezuela
  const OSM_DEFAULT =
    'https://www.openstreetmap.org/export/embed.html?bbox=-68.3136%2C10.8917%2C-68.2336%2C10.9717&layer=mapnik&marker=10.9317%2C-68.2736';

  if (!raw || raw.trim() === '') return OSM_DEFAULT;

  // If the admin pasted a complete <iframe ...> tag, extract the src attribute
  if (raw.includes('src=')) {
    const match = raw.match(/src=["']([^"']+)["']/);
    if (match && match[1]) return match[1]; // trust what Google generated
  }

  // If it's already a proper Google Maps Embed API URL (share  embed map)
  if (raw.includes('google.com/maps/embed')) return raw;

  // If it looks like a Google Maps URL (but NOT a proper embed URL),
  // we cannot convert it without an API key — fall back to OSM
  if (raw.includes('google.com/maps') || raw.includes('maps.google.com')) {
    return OSM_DEFAULT;
  }

  // If the admin pasted an OSM embed URL directly, use it
  if (raw.includes('openstreetmap.org')) return raw;

  // Raw coordinates  "lat,lng"  e.g. "10.9317,-68.2736"
  const coordMatch = raw.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    const delta = 0.04;
    return (
      `https://www.openstreetmap.org/export/embed.html?` +
      `bbox=${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}` +
      `&layer=mapnik&marker=${lat}%2C${lng}`
    );
  }

  // Anything else  OSM default
  return OSM_DEFAULT;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  badge = ' Ubicación Privilegiada',
  title = 'Chichiriviche • Calle 15',
  subtitle = 'Urbanización privada segura con fácil acceso a los embarcaderos y al Parque Nacional Morrocoy.',
  address = PROPERTY_INFO.locationName,
  description = (PROPERTY_INFO as any).locationDescription || (PROPERTY_INFO as any).shortLocation || 'Urbanización privada tranquila y segura en Chichiriviche.',
  mapsLink = PROPERTY_INFO.googleMapsUrl,
  embedUrl,
  bullet1 = '5 minutos de los embarcaderos a Cayo Sombrero',
  bullet2 = 'Condominio privado con vigilancia las 24 horas',
  bullet3 = 'Supermercados y servicios a 3 minutos',
}) => {
  const resolvedEmbed = React.useMemo(() => resolveEmbedUrl(embedUrl), [embedUrl]);

  return (
    <section className="py-16 sm:py-24 bg-[#efeeea] text-[#1c1c1c] relative font-sans ">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        <SectionHeader title={title} subtitle={subtitle} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Details Card */}
          <Reveal className="lg:col-span-5 bg-[#efeeea] rounded-2xl sm:rounded-3xl p-4 sm:p-8   space-y-5 sm:space-y-6">
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs ">
                <MapPin className="w-4 h-4" />
                <span>Dirección Exacta</span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#1c1c1c]">{address}</h3>
              <p className="text-xs text-[#1c1c1c]/80 leading-relaxed font-sans">{description}</p>
            </div>

            <Stagger delay={0.2} className="space-y-2.5 sm:space-y-3 pt-3 sm:pt-4 ">
              <StaggerItem className="flex items-center gap-3 text-xs font-semibold text-[#1c1c1c]">
                <span className="w-9 h-9 rounded-full bg-[#1c1c1c] text-emerald-100 flex items-center justify-center shrink-0">{React.createElement(iconForText(String(bullet1)), { className: 'w-4 h-4', strokeWidth: 1.75 })}</span>
                <span>{stripEmoji(String(bullet1))}</span>
              </StaggerItem>
              <StaggerItem className="flex items-center gap-3 text-xs font-semibold text-[#1c1c1c]">
                <span className="w-9 h-9 rounded-full bg-[#1c1c1c] text-emerald-100 flex items-center justify-center shrink-0">{React.createElement(iconForText(String(bullet2)), { className: 'w-4 h-4', strokeWidth: 1.75 })}</span>
                <span>{stripEmoji(String(bullet2))}</span>
              </StaggerItem>
              <StaggerItem className="flex items-center gap-3 text-xs font-semibold text-[#1c1c1c]">
                <span className="w-9 h-9 rounded-full bg-[#1c1c1c] text-emerald-100 flex items-center justify-center shrink-0">{React.createElement(iconForText(String(bullet3)), { className: 'w-4 h-4', strokeWidth: 1.75 })}</span>
                <span>{stripEmoji(String(bullet3))}</span>
              </StaggerItem>
            </Stagger>

            <div className="pt-2">
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl sm:rounded-2xl bg-[#1c1c1c] text-white hover:bg-emerald-900 text-xs font-bold transition  min-h-[48px] active:scale-95 cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span className="leading-snug">Abrir en Google Maps GPS</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1 shrink-0" />
              </a>
            </div>
          </Reveal>

          {/* Map iframe */}
          <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl overflow-hidden  border-2 sm:border-4 border-white h-[280px] sm:h-[380px] lg:h-[420px] relative bg-[#e1dfd8]">
            <PhotoReveal className="w-full h-full">
            <iframe
              title="Ubicación Villa María"
              src={resolvedEmbed}
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            </PhotoReveal>
          </div>
        </div>
      </div>
    </section>
  );
};
