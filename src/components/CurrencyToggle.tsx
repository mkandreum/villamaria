import React from 'react';
import { useCurrency } from '../context/CurrencyContext';

export const CurrencyToggle: React.FC = () => {
  const { currency, setCurrency, exchange } = useCurrency();

  const rateLabel = exchange.rate != null ? `Bs. ${exchange.rate}` : '…';

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full bg-white  p-0.5 "
      title={exchange.rate != null ? `Tasa del día (BCV): ${rateLabel} · ${exchange.date || ''}` : 'Tasa BCV'}
    >
      {(['USD', 'BS'] as const).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          aria-pressed={currency === c}
          className={`px-2.5 py-1 rounded-full text-[13px] font-bold transition active:scale-95 ${
            currency === c
              ? 'bg-[#1c1c1c] text-white shadow'
              : 'text-[#1c1c1c]/70 hover:text-[#1c1c1c] hover:bg-[#e1dfd8]/60'
          }`}
        >
          {c === 'USD' ? 'USD' : 'Bs'}
        </button>
      ))}
    </div>
  );
};