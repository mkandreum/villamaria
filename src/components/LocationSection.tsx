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
 *  1. If user pasted a full <iframe> tag → extract the src and use it directly.
 *  2. If the URL already is a proper google.com/maps/embed?pb=... → use it directly.
 *  3. Otherwise → fall back to OpenStreetMap (no API key required, no errors).
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

  // If it's already a proper Google Maps Embed API URL (share → embed map)
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

  // Anything else → OSM default
  return OSM_DEFAULT;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  badge = '📍 Ubicación Privilegiada',
  title = 'Chichiriviche • Calle 15 🌴',
  subtitle = 'Urbanización privada segura con fácil acceso a los embarcaderos y al Parque Nacional Morrocoy.',
  address = PROPERTY_INFO.locationName,
  description = PROPERTY_INFO.locationDescription,
  mapsLink = PROPERTY_INFO.googleMapsUrl,
  embedUrl,
  bullet1 = '5 minutos de los embarcaderos a Cayo Sombrero',
  bullet2 = 'Condominio privado con vigilancia las 24 horas',
  bullet3 = 'Supermercados y servicios a 3 minutos',
}) => {
  const resolvedEmbed = React.useMemo(() => resolveEmbedUrl(embedUrl), [embedUrl]);

  return (
    <section id="location" className="py-12 sm:py-20 bg-[#F8F5F0] text-[#1B3B36] relative font-sans border-b border-[#1B3B36]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-900/10 border border-emerald-800/20 text-emerald-900 text-xs font-bold font-sans uppercase tracking-wider mb-2">
            <span>{badge}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#1B3B36] font-bold tracking-tight">
            {title}
          </h2>
          <p className="text-[#1B3B36]/70 text-xs sm:text-sm mt-2">
            {subtitle}
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

          {/* Map iframe */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden shadow-xl border-4 border-white h-[350px] sm:h-[420px] relative bg-[#EAE3D8]">
            <iframe
              title="Ubicación Villa María"
              src={resolvedEmbed}
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
