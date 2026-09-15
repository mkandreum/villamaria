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
      className="relative z-40 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 border-b border-emerald-500/30 text-emerald-100 py-1 text-[11px] font-sans shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between relative max-w-full">
        {/* Continuous Left-Scrolling Marquee Container */}
        <div className="overflow-hidden flex-1 relative flex items-center">
          <div className="animate-marquee flex items-center gap-6 whitespace-nowrap">
            {tickerItems.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div key={idx} className="inline-flex items-center gap-2 shrink-0 px-1">
                  <span className="shimmer-badge px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                    <IconComponent className="w-2.5 h-2.5 text-emerald-400" />
                    <span>{item.badge}</span>
                  </span>
                  <span className="text-[11px] text-white font-medium">
                    {item.content}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Close Button - Clean without background box */}
        <div className="px-2.5 z-10 shrink-0 flex items-center">
          <button
            onClick={() => {
              setVisible(false);
              if (onClose) onClose();
            }}
            className="text-emerald-300/70 hover:text-white transition-colors p-1 flex items-center justify-center"
            title="Cerrar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
