import { useSite } from '../context/SiteContext';
import React from 'react';
import { Stagger, StaggerItem } from './Reveal';
import { SectionHeader } from './SectionHeader';
import { iconForText, stripEmoji, ICON_CHOICES } from '../utils/icons';

interface AmenitiesSectionProps {
  amenities?: any;
  title?: string;
  subtitle?: string;
}

export const AmenitiesSection: React.FC<AmenitiesSectionProps> = ({
  amenities,
  title,
  subtitle,
}) => {
  const { t, siteName } = useSite();
  const normalizedAmenities = React.useMemo(() => {
    if (!amenities) return [];
    let list = amenities;
    if (typeof amenities === 'string') {
      try {
        list = JSON.parse(amenities);
      } catch {
        list = [];
      }
    }
    if (!Array.isArray(list)) return [];

    return list.map((item: any, idx: number) => ({
      id: item.id || `am-${idx}`,
      title: item.title || item.name || item,
      description: item.description || '',
      icon: item.icon || '',
    }));
  }, [amenities]);

  if (normalizedAmenities.length === 0) return null;


  return (
    <section className="py-16 sm:py-24 bg-[#e1dfd8]/40 text-[#1c1c1c] relative font-sans ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title={stripEmoji(title)} subtitle={subtitle} />

        <Stagger gap={0.06} className="grid grid-cols-1 md:grid-cols-2 gap-x-14 ">
          {normalizedAmenities.map((item: any, idx: number) => {
            const label = stripEmoji(String(item.title));
            const Icon = ICON_CHOICES[item.icon]?.Icon || iconForText(`${label} ${item.description || ''}`);
            return (
              <StaggerItem key={item.id || idx}>
                <div className="flex items-start gap-4 py-5 sm:py-6 ">
                  <span className="mt-0.5 w-11 h-11 shrink-0 rounded-full bg-[#1c1c1c] text-emerald-100 flex items-center justify-center">
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-serif font-bold text-[#1c1c1c] leading-snug">{label}</h3>
                    {item.description && <p className="text-sm text-[#1c1c1c]/70 leading-relaxed mt-1 text-pretty">{item.description}</p>}
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
};
