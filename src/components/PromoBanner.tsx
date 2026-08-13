import React, { useState } from 'react';
import { Sparkles, ShieldCheck, X, Zap } from 'lucide-react';

export const PromoBanner: React.FC = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <aside aria-label="Anuncio especial" className="relative z-40 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 border-b border-emerald-500/30 text-emerald-100 py-2.5 px-4 text-xs font-sans animate-slide-up shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="shimmer-badge px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/40 flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
            Ofertón de Temporada
          </span>
          <p className="text-[11px] sm:text-xs text-emerald-100 font-medium truncate">
            ✨ <strong className="text-white font-bold">Garantía Villa María:</strong> Agua constante, planta eléctrica 24/7 y piscina climatizada privada.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-1 text-[11px] text-emerald-300 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cancelación Gratuita</span>
          </div>
          <button
            onClick={() => setVisible(false)}
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
