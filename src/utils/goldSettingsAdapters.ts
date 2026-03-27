// src/utils/goldSettingsAdapters.ts
import { GoldSettings, GoldPricingSettingsForm, EMPTY_GOLD_SETTINGS } from '../types/gold';

export const toNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const toGoldSettings = (data: any): GoldSettings => ({
  goldOunceUsd: toNumber(data?.goldOunceUsd),
  premiumOunceUsd: toNumber(data?.premiumOunceUsd),
  usdToIls: toNumber(data?.usdToIls),
  usdToJod: toNumber(data?.usdToJod),
});

export const toFormSettings = (settings: GoldSettings): GoldPricingSettingsForm => ({
  goldOunceUsd: String(settings.goldOunceUsd ?? ''),
  premiumOunceUsd: String(settings.premiumOunceUsd ?? ''),
  usdToIls: String(settings.usdToIls ?? ''),
  usdToJod: String(settings.usdToJod ?? ''),
});

export const fromFormSettings = (form: GoldPricingSettingsForm): GoldSettings => ({
  goldOunceUsd: toNumber(form.goldOunceUsd),
  premiumOunceUsd: toNumber(form.premiumOunceUsd),
  usdToIls: toNumber(form.usdToIls),
  usdToJod: toNumber(form.usdToJod),
});

export const ensureGoldSettings = (settings: GoldSettings | null | undefined): GoldSettings =>
  settings ?? EMPTY_GOLD_SETTINGS;