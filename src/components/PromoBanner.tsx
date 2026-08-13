import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, X, Compass, Waves } from 'lucide-react';

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
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setVisible(enabled);
  }, [enabled]);

  const defaultItems = [
    {
      id: 1,
      icon: Sparkles,
      badge: 'Garantía Total',
      content: text || 'Suministro constante de agua, planta eléctrica 24/7 y piscina privada climatizada.',
    },
    {
      id: 2,
      icon: Compass,
      badge: 'Ubicación Premium',
      content: 'A solo 5 minutos de los embarcaderos principales a Cayo Sombrero.',
    },
    {
      id: 3,
      icon: Waves,
      badge: 'Reserva Flexible',
      content: 'Confirmación inmediata y cancelación gratuita sin complicaciones.',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % defaultItems.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [defaultItems.length]);

  if (!visible) return null;

  const current = defaultItems[currentIndex];
  const IconComponent = current.icon;

  return (
    <aside
      aria-label="Anuncio promocional"
      className="relative z-40 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 border-b border-emerald-500/30 text-emerald-100 py-2 px-3 text-xs font-sans shadow-md"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <span className="shimmer-badge px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/40 flex items-center gap-1 shrink-0">
            <IconComponent className="w-3 h-3 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{current.badge}</span>
          </span>

          <div className="relative overflow-hidden flex-1 h-5 flex items-center">
            <p
              key={current.id}
              className="text-[11px] sm:text-xs text-white font-medium truncate transition-all duration-500 transform animate-slide-up"
            >
              {current.content}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden xs:flex items-center gap-1">
            {defaultItems.map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'bg-emerald-400 w-3' : 'bg-emerald-800'
                }`}
              />
            ))}
          </div>

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
