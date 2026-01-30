// src/context/CurrencyContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CurrencyCode } from '../theme/currency';
import { formatPrice, convertFromUsd } from '../theme/currency';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => Promise<void>;
  formatPrice: (valueUsd: number) => string;
  convert: (valueUsd: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
    undefined
);

const CURRENCY_KEY = 'stella_currency';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                            children,
                                                                          }) => {
  // Default = USD ($)
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrency();
  }, []);

  const loadCurrency = async () => {
    try {
      const saved = await AsyncStorage.getItem(CURRENCY_KEY);

      if (saved === 'USD' || saved === 'JOD' || saved === 'ILS') {
        setCurrencyState(saved as CurrencyCode);
      }
    } catch (error) {
      console.error('Error loading currency:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setCurrency = async (newCurrency: CurrencyCode) => {
    try {
      setCurrencyState(newCurrency);
      await AsyncStorage.setItem(CURRENCY_KEY, newCurrency);
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  };

  if (isLoading) return null;

  return (
      <CurrencyContext.Provider
          value={{
            currency,
            setCurrency,
            formatPrice: (valueUsd: number) => formatPrice(valueUsd, currency),
            convert: (valueUsd: number) => convertFromUsd(valueUsd, currency),
          }}
      >
        {children}
      </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return ctx;
};
