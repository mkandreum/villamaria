import { useSite } from '../context/SiteContext';
import { SectionHeader } from './SectionHeader';
import { PhotoReveal } from './Motion';
import { Reveal, Stagger, StaggerItem } from './Reveal';
import { iconForText, stripEmoji } from '../utils/icons';
import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

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

  if (!raw || raw.trim() === '') return '';

  // If the admin pasted a complete <iframe ...> tag, extract the src attribute
  if (raw.includes('src=')) {
    const match = raw.match(/src=["']([^"']+)["']/);
    if (match && match[1]) return match[1]; // trust what Google generated
  }

  // If it's already a proper Google Maps Embed API URL (share  embed map)
  if (raw.includes('google.com/maps/embed')) return raw;

  // If the admin pasted an OSM embed URL directly, use it
  if (raw.includes('openstreetmap.org')) return raw;

  // Coordinates, alone or inside a normal Google Maps link (which cannot be embedded as is)
  const coordMatch = raw.match(/^\s*(-?\d+\.?\d*),\s*(-?\d+\.?\d*)\s*$/) || raw.match(/[@=](-?\d+\.\d+),\s*(-?\d+\.\d+)/);
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

  // Nothing usable: no map rather than a broken frame
  return '';
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  badge,
  title,
  subtitle,
  address,
  description,
  mapsLink,
  embedUrl,
  bullet1,
  bullet2,
  bullet3,
}) => {
  const { t, siteName } = useSite();
  const resolvedEmbed = React.useMemo(() => (String(embedUrl ?? '').trim() ? resolveEmbedUrl(embedUrl) : ''), [embedUrl]);
  const bullets = [bullet1, bullet2, bullet3].map((b) => stripEmoji(b)).filter(Boolean);

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
                <span>{t('txt_loc_addr')}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#1c1c1c]">{address}</h3>
              <p className="text-xs text-[#1c1c1c]/80 leading-relaxed font-sans">{description}</p>
            </div>

            {bullets.length > 0 && (
            <Stagger delay={0.2} className="space-y-2.5 sm:space-y-3 pt-3 sm:pt-4 ">
              {bullets.map((bullet) => (
                <StaggerItem key={bullet} className="flex items-center gap-3 text-xs font-semibold text-[#1c1c1c]">
                  <span className="w-9 h-9 rounded-full bg-[#1c1c1c] text-emerald-100 flex items-center justify-center shrink-0">{React.createElement(iconForText(bullet), { className: 'w-4 h-4', strokeWidth: 1.75 })}</span>
                  <span>{bullet}</span>
                </StaggerItem>
              ))}
            </Stagger>
            )}

            {mapsLink && <div className="pt-2">
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl sm:rounded-2xl bg-[#1c1c1c] text-white hover:bg-emerald-900 text-xs font-bold transition  min-h-[48px] active:scale-95 cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span className="leading-snug">{t('txt_loc_btn')}</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1 shrink-0" />
              </a>
            </div>}
          </Reveal>

          {/* Map iframe */}
          {resolvedEmbed && (<div className="lg:col-span-7 rounded-2xl sm:rounded-3xl overflow-hidden  border-2 sm:border-4 border-white h-[280px] sm:h-[380px] lg:h-[420px] relative bg-[#e1dfd8]">
            <PhotoReveal className="w-full h-full">
            <iframe
              title={t('txt_loc_addr')}
              src={resolvedEmbed}
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            </PhotoReveal>
          </div>)}
        </div>
      </div>
    </section>
  );
};
