import React from 'react';
import { useCurrency } from '../context/CurrencyContext';

export const CurrencyToggle: React.FC = () => {
  const { currency, setCurrency, exchange } = useCurrency();

  const rateLabel = exchange.rate != null ? `Bs. ${exchange.rate}` : '…';

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full bg-white border border-[#1B3B36]/20 p-0.5 shadow-sm"
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
              ? 'bg-[#1B3B36] text-white shadow'
              : 'text-[#1B3B36]/70 hover:text-[#1B3B36] hover:bg-[#EAE3D8]/60'
          }`}
        >
          {c === 'USD' ? 'USD' : 'Bs'}
        </button>
      ))}
    </div>
  );
};