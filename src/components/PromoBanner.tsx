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
      className="relative z-40 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 border-b border-emerald-500/30 text-emerald-100 py-2 text-xs font-sans shadow-md overflow-hidden"
    >
      <div className="flex items-center justify-between relative max-w-full">
        {/* Continuous Left-Scrolling Marquee Container */}
        <div className="overflow-hidden flex-1 relative flex items-center">
          <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
            {tickerItems.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div key={idx} className="inline-flex items-center gap-2.5 shrink-0 px-2">
                  <span className="shimmer-badge px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                    <IconComponent className="w-3 h-3 text-emerald-400" />
                    <span>{item.badge}</span>
                  </span>
                  <span className="text-[11px] sm:text-xs text-white font-medium">
                    {item.content}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Close Button */}
        <div className="pl-2 pr-3 bg-emerald-950/90 z-10 shrink-0">
          <button
            onClick={() => {
              setVisible(false);
              if (onClose) onClose();
            }}
            className="p-1 rounded-full text-emerald-400/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Cerrar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
