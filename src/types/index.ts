export interface GoldRate {
  label: string;
  value: number;
  currency: string;
}

export interface RatesResponse {
  lastUpdate: string;
  rates: GoldRate[];
}

export interface HistoryPoint {
  date: string;
  price: number;
}

export interface HistoryResponse {
  karat: string;
  data: HistoryPoint[];
  minPrice: number;
  maxPrice: number;
}

export interface Offer {
  id: string;
  name: string;
  karat: string;
  originalPrice: number;
  discountedPrice: number;
  imageUrl?: string;
  imageUri?: string;
  description?: string;
  isActive: boolean;
}

export interface AdminProduct {
  id?: string;
  name: string;
  description: string;
  karat: string;
  originalPrice: number;
  discountedPrice: number;
  imageUrl?: string;
  imageUri?: string;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface Settings {
  buyMargin: number;
  sellMargin: number;
  makingFeePerGram: number;
  rulesText: string;
  socialMedia: {
    whatsapp: string;
    instagram: string;
    tiktok: string;
    facebook: string;
  };
}
