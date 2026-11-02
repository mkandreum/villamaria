import React from 'react';
import { Stagger, StaggerItem } from './Reveal';
import { SectionHeader } from './SectionHeader';
import { iconForText, stripEmoji } from '../utils/icons';
import { AMENITIES } from '../data/mockData';

interface AmenitiesSectionProps {
  amenities?: any;
  title?: string;
  subtitle?: string;
}

export const AmenitiesSection: React.FC<AmenitiesSectionProps> = ({
  amenities,
  title = 'Comodidades incluidas',
  subtitle = 'Instalaciones preparadas para tu máximo confort durante tus vacaciones en Chichiriviche.',
}) => {
  const normalizedAmenities = React.useMemo(() => {
    if (!amenities) return AMENITIES;
    let list = amenities;
    if (typeof amenities === 'string') {
      try {
        list = JSON.parse(amenities);
      } catch {
        list = [];
      }
    }
    if (!Array.isArray(list) || list.length === 0) return AMENITIES;

    return list.map((item, idx) => ({
      id: item.id || `am-${idx}`,
      title: item.title || item.name || item,
      description: item.description || 'Comodidad incluida para tu estancia.',
      emoji: item.emoji || '✨',
    }));
  }, [amenities]);


  return (
    <section className="py-16 sm:py-24 bg-[#EAE3D8]/40 text-[#1B3B36] relative font-sans border-b border-[#1B3B36]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title={stripEmoji(title)} subtitle={subtitle} />

        <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-x-14 border-t border-[#1B3B36]/15">
          {normalizedAmenities.map((item: any, idx: number) => {
            const label = stripEmoji(String(item.title));
            const Icon = iconForText(`${label} ${item.description || ''}`);
            return (
              <StaggerItem key={item.id || idx}>
                <div className="flex items-start gap-4 py-5 sm:py-6 border-b border-[#1B3B36]/15">
                  <span className="mt-0.5 w-11 h-11 shrink-0 rounded-full bg-[#1B3B36] text-emerald-100 flex items-center justify-center">
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-serif font-bold text-[#1B3B36] leading-snug">{label}</h3>
                    <p className="text-sm text-[#1B3B36]/70 leading-relaxed mt-1 text-pretty">{item.description}</p>
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
