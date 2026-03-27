export type CurrencyCode = 'USD' | 'JOD' | 'ILS';

export type CurrencyRates = {
    USD: number;
    JOD: number;
    ILS: number;
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
    USD: '$',
    JOD: 'JOD',
    ILS: '₪',
};

export const convertFromUsd = (
  amountUsd: number,
  currency: CurrencyCode,
  rates: CurrencyRates,
): number => {
    const rate = rates[currency] ?? 1;
    return amountUsd * rate;
};

export const formatPrice = (
  amountUsd: number,
  currency: CurrencyCode,
  rates: CurrencyRates,
): string => {
    const value = convertFromUsd(amountUsd, currency, rates);
    const symbol = CURRENCY_SYMBOLS[currency] ?? '';
    return `${value.toFixed(2)} ${symbol}`;
};