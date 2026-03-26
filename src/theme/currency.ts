// src/theme/currency.ts

// The 3 currencies we support
export type CurrencyCode = 'USD' | 'JOD' | 'ILS';

// Simple static rates (relative to 1 USD).
// You can change these later or load them from your backend.
export const CURRENCY_RATES: Record<CurrencyCode, number> = {
    USD: 1,
    JOD: 0.7, // example value
    ILS: 3.1,  // example value
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
    USD: '$',
    JOD: 'JOD',
    ILS: '₪',
};

export const convertFromUsd = (
    amountUsd: number,
    currency: CurrencyCode,
): number => {
    const rate = CURRENCY_RATES[currency] ?? 1;
    return amountUsd * rate;
};

export const formatPrice = (
    amountUsd: number,
    currency: CurrencyCode,
): string => {
    const value = convertFromUsd(amountUsd, currency);
    const symbol = CURRENCY_SYMBOLS[currency] ?? '';
    return `${value.toFixed(2)} ${symbol}`;
};
