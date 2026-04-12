import axios from 'axios';
import type { Settings } from '../types';
import { GOLD_HISTORY_MONTHLY_USD } from '../data/goldHistoryMonthlyUsd';

const USE_MOCK = true;

const BASE_URL = 'https://api.myserver.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type GoldHistoryPoint = {
  date: string;
  price: number;
};

export type GoldHistoryResponse = {
  karat: string;
  currency: 'USD';
  data: GoldHistoryPoint[];
  maxPrice: number;
  minPrice: number;
  latestPrice: number;
};

const OUNCE_TO_GRAMS = 31.1034768;

const karatMultiplier = (karat: string) => {
  switch (karat) {
    case '24k':
      return 1;
    case '22k':
      return 22 / 24;
    case '21k':
      return 21 / 24;
    case '18k':
      return 18 / 24;
    default:
      return 21 / 24;
  }
};

export const getHistory = async (karat: '24k' | '22k' | '21k' | '18k' = '21k'): Promise<GoldHistoryResponse> => {
  const multiplier = karatMultiplier(karat);

  const data: GoldHistoryPoint[] = GOLD_HISTORY_MONTHLY_USD.map((point) => {
    const gram24kUsd = point.priceUsdPerOunce / OUNCE_TO_GRAMS;
    const gramKaratUsd = gram24kUsd * multiplier;

    return {
      date: point.date,
      price: Number(gramKaratUsd.toFixed(2)),
    };
  });

  const prices = data.map((item) => item.price);

  return {
    karat,
    currency: 'USD',
    data,
    maxPrice: Math.max(...prices),
    minPrice: Math.min(...prices),
    latestPrice: prices[prices.length - 1],
  };
};

let mockSettings: Settings = {
  buyMargin: 50,
  sellMargin: 30,
  makingFeePerGram: 100,
  rulesText:
    'سعر الذهب يتغير يومياً حسب السوق العالمي.\nالأسعار المعروضة شاملة ضريبة القيمة المضافة.\nيمكنكم الاستفسار عن أي منتج عبر التواصل معنا.',
  socialMedia: {
    whatsapp: 'https://wa.me/201234567890',
    instagram: 'https://instagram.com/stella_gold',
    tiktok: 'https://tiktok.com/@stella_gold',
    facebook: 'https://facebook.com/stella_gold',
  },
};

export const getSettings = async (): Promise<Settings> => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockSettings), 500);
    });
  }
  const response = await api.get<Settings>('/admin/settings');
  return response.data;
};

export const updateSettings = async (settings: Settings): Promise<Settings> => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      mockSettings = settings;
      setTimeout(() => resolve(settings), 500);
    });
  }
  const response = await api.put<Settings>('/admin/settings', settings);
  return response.data;
};