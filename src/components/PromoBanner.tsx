import React, { useState } from 'react';
import { Sparkles, Compass, Waves, ShieldCheck, X } from 'lucide-react';

interface PromoBannerProps {
  enabled?: boolean;
  text?: string;
  onClose?: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({
  enabled = true,
  text,
  onClose,
}) => {
  const [visible, setVisible] = useState(enabled);

  if (!enabled || !visible) return null;

  const promoItems = [
    {
      icon: Sparkles,
      badge: 'Garantía Total',
      content: text || 'Suministro constante de agua, planta eléctrica 24/7 y piscina privada climatizada.',
    },
    {
      icon: Compass,
      badge: 'Ubicación Premium',
      content: 'Calle 15, Chichiriviche • A 5 minutos de los embarcaderos a Cayo Sombrero.',
    },
    {
      icon: ShieldCheck,
      badge: 'Reserva Flexible',
      content: 'Confirmación inmediata por WhatsApp y atención personalizada.',
    },
    {
      icon: Waves,
      badge: 'Piscina Privada',
      content: 'Piscina climatizada con hamacas y área de solárium.',
    },
  ];

  // Duplicate items for continuous loop
  const tickerItems = [...promoItems, ...promoItems];

  return (
    <aside
      aria-label="Anuncio promocional"
      className="relative z-40 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 border-b border-emerald-500/20 text-emerald-100 py-0.5 h-6 sm:h-7 flex items-center text-[10px] font-sans shadow-none overflow-hidden"
    >
      <div className="flex items-center justify-between relative w-full">
        {/* Continuous Left-Scrolling Marquee Container */}
        <div className="overflow-hidden flex-1 relative flex items-center">
          <div className="animate-marquee flex items-center gap-5 whitespace-nowrap">
            {tickerItems.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div key={idx} className="inline-flex items-center gap-1.5 shrink-0 px-1">
                  <span className="shimmer-badge px-1.5 py-0 rounded-full text-[8px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/30 flex items-center gap-1 leading-tight">
                    <IconComponent className="w-2 h-2 text-emerald-400" />
                    <span>{item.badge}</span>
                  </span>
                  <span className="text-[10px] text-white/90 font-medium leading-none">
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
            className="text-emerald-300/60 hover:text-white transition-colors p-0.5 flex items-center justify-center"
            title="Cerrar aviso"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
};
