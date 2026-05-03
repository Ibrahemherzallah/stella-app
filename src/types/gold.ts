// src/types/stellagold.ts
export interface GoldSettings {
  goldOunceUsd: number;
  premiumOunceUsd: number;
  usdToIls: number;
  usdToJod: number;
}

export interface GoldPricingSettingsForm {
  goldOunceUsd: string;
  premiumOunceUsd: string;
  usdToIls: string;
  usdToJod: string;
}

export const EMPTY_GOLD_SETTINGS: GoldSettings = {
  goldOunceUsd: 0,
  premiumOunceUsd: 0,
  usdToIls: 0,
  usdToJod: 0,
};

export const EMPTY_GOLD_SETTINGS_FORM: GoldPricingSettingsForm = {
  goldOunceUsd: '',
  premiumOunceUsd: '',
  usdToIls: '',
  usdToJod: '',
};