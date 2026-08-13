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
 * Converts any Google Maps URL to the proper embed-compatible URL.
 * Google blocks iframes using regular maps.google.com URLs — only
 * google.com/maps/embed?pb=... or maps.google.com/maps?q=...&output=embed work.
 */
function normalizeGoogleMapsUrl(url: string): string {
  if (!url) return 'https://maps.google.com/maps?q=Chichiriviche%2C+Venezuela&z=14&output=embed';

  // Already a proper embed URL — let it through unchanged
  if (url.includes('google.com/maps/embed')) return url;
  if (url.includes('output=embed')) return url;

  // maps.google.com/maps?q=... → add &output=embed
  if (url.includes('maps.google.com/maps')) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}output=embed`.replace(/&output=embed&output=embed/, '&output=embed');
  }

  // www.google.com/maps/place/... or /maps/@... → convert to embed
  if (url.includes('google.com/maps')) {
    // Extract query param if present
    const qMatch = url.match(/[?&]q=([^&]+)/);
    const query = qMatch ? qMatch[1] : 'Chichiriviche%2C+Venezuela';
    return `https://maps.google.com/maps?q=${query}&z=14&output=embed`;
  }

  // Raw coordinates like 10.9317,-68.2736
  const coordMatch = url.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=15&output=embed`;
  }

  // Fallback: treat as search query
  const encoded = encodeURIComponent(url);
  return `https://maps.google.com/maps?q=${encoded}&z=14&output=embed`;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  badge = '📍 Ubicación Privilegiada',
  title = 'Chichiriviche • Calle 15 🌴',
  subtitle = 'Urbanización privada segura con fácil acceso a los embarcaderos y al Parque Nacional Morrocoy.',
  address = PROPERTY_INFO.locationName,
  description = PROPERTY_INFO.locationDescription,
  mapsLink = PROPERTY_INFO.googleMapsUrl,
  embedUrl = 'https://maps.google.com/maps?q=Chichiriviche,Venezuela&t=&z=14&ie=UTF8&iwloc=&output=embed',
  bullet1 = '5 minutos de los embarcaderos a Cayo Sombrero',
  bullet2 = 'Condominio privado con vigilancia las 24 horas',
  bullet3 = 'Supermercados y servicios a 3 minutos',
}) => {
// Clean and normalize any Google Maps URL to the proper embed format
  const cleanedEmbedUrl = React.useMemo(() => {
    const raw = embedUrl || '';

    // 1. If it's a full <iframe> tag, extract the src
    if (raw.includes('src=')) {
      const match = raw.match(/src=["']([^"']+)["']/);
      if (match && match[1]) return normalizeGoogleMapsUrl(match[1]);
    }

    return normalizeGoogleMapsUrl(raw);
  }, [embedUrl]);


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

          {/* Dynamic Map Preview iframe */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden shadow-xl border-4 border-white h-[350px] sm:h-[420px] relative bg-[#EAE3D8]">
            <iframe
              title="Ubicación Villa María"
              src={cleanedEmbedUrl}
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
