import React from 'react';
import { useCurrency } from '../context/CurrencyContext';

export const CurrencyToggle: React.FC = () => {
  const { currency, setCurrency, exchange } = useCurrency();

  const rateLabel = exchange.rate != null ? `Bs. ${exchange.rate}` : '…';

  return (
    <div
      className="flex items-center gap-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 p-0.5"
      title={exchange.rate != null ? `Tasa del día (BCV): ${rateLabel} · ${exchange.date || ''}` : 'Tasa BCV'}
    >
      {(['USD', 'BS'] as const).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          aria-pressed={currency === c}
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all active:scale-95 ${
            currency === c
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-950 shadow-md shadow-emerald-500/30'
              : 'text-emerald-200/80 hover:text-white hover:bg-white/10'
          }`}
        >
          {c === 'USD' ? 'USD' : 'Bs'}
        </button>
      ))}
    </div>
  );
};