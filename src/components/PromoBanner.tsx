import React, { useState } from 'react';
import { Sparkles, Compass, Waves, ShieldCheck, X } from 'lucide-react';

interface PromoBannerProps {
  enabled?: boolean;
  text?: string;
  items?: Array<{ badge?: string; text?: string }>;
  onClose?: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({
  enabled = true,
  text,
  items,
  onClose,
}) => {
  const [visible, setVisible] = useState(enabled);

  if (!enabled || !visible) return null;

  const icons = [Sparkles, Compass, ShieldCheck, Waves];
  const defaults = [
    { badge: 'Garantía Total', text: text || 'Suministro constante de agua, planta eléctrica 24/7 y piscina privada climatizada.' },
    { badge: 'Ubicación Premium', text: 'Calle 15, Chichiriviche • A 5 minutos de los embarcaderos a Cayo Sombrero.' },
    { badge: 'Reserva Flexible', text: 'Confirmación inmediata por WhatsApp y atención personalizada.' },
    { badge: 'Piscina Privada', text: 'Piscina climatizada con hamacas y área de solárium.' },
  ];
  const source = (items || []).filter((i) => i && String(i.text || '').trim());
  const promoItems = (source.length > 0 ? source : defaults).map((i, idx) => ({
    icon: icons[idx % icons.length],
    badge: i.badge || '',
    content: String(i.text),
  }));

  // Duplicate items for continuous loop
  const tickerItems = [...promoItems, ...promoItems];

  return (
    <aside
      aria-label="Anuncio promocional"
      className="relative z-40 bg-emerald-950 text-emerald-100 py-0.5 h-8 sm:h-9 flex items-center text-[13px] font-sans  overflow-hidden"
    >
      <div className="flex items-center justify-between relative w-full">
        {/* Continuous Left-Scrolling Marquee Container */}
        <div className="overflow-hidden flex-1 relative flex items-center">
          <div className="animate-marquee flex items-center gap-5 whitespace-nowrap">
            {tickerItems.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div key={idx} className="inline-flex items-center gap-1.5 shrink-0 px-1">
                  {item.badge ? <span className="font-bold text-emerald-300 flex items-center gap-1.5 leading-tight">
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{item.badge}</span>
                  </span> : null}
                  <span className="text-[13px] text-white/90 font-medium leading-none">
                    {item.content}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Close Button - Clean & Compact */}
        <div className="px-2 z-10 shrink-0 flex items-center">
          <button
            onClick={() => {
              setVisible(false);
              if (onClose) onClose();
            }}
            className="text-emerald-300/60 hover:text-white transition p-0.5 flex items-center justify-center"
            title="Cerrar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
