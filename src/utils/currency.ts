export type CurrencyCode = 'USD' | 'BS';

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  USD: 'USD',
  BS: 'Bs',
};

/**
 * Formats a price stored in USD into the selected display currency.
 * - USD: e.g. "$150"
 * - BS:  e.g. "Bs. 9.600,50" (USD amount × BCV rate, es-VE grouping)
 */
export function formatPrice(usd: number, currency: CurrencyCode, bcvRate?: number | null): string {
  const amount = Number(usd) || 0;

  if (currency === 'BS') {
    const rate = Number(bcvRate) || 0;
    const value = rate > 0 ? amount * rate : amount;
    return `Bs. ${new Intl.NumberFormat('es-VE', { maximumFractionDigits: 2 }).format(value)}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}