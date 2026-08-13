import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CurrencyCode } from '../utils/currency';
import { formatPrice } from '../utils/currency';

const STORAGE_KEY = 'villamaria_currency';

interface ExchangeInfo {
  rate: number | null;
  date: string | null;
  updatedAt: string | null;
  source?: string;
}

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  exchange: ExchangeInfo;
  formatPrice: (usd: number, currencyOverride?: CurrencyCode) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'BS' ? 'BS' : 'USD';
    } catch {
      return 'USD';
    }
  });

  const [exchange, setExchange] = useState<ExchangeInfo>({ rate: null, date: null, updatedAt: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/exchange-rate');
        const data = await res.json();
        if (!cancelled && data) {
          setExchange({
            rate: data.rate ?? null,
            date: data.date ?? null,
            updatedAt: data.updatedAt ?? null,
            source: data.source,
          });
        }
      } catch {
        // Offline / server unavailable: keep previous rate
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency,
      exchange,
      formatPrice: (usd: number, currencyOverride?: CurrencyCode) =>
        formatPrice(usd, currencyOverride ?? currency, exchange.rate),
    }),
    [currency, setCurrency, exchange]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency debe usarse dentro de CurrencyProvider');
  return ctx;
}