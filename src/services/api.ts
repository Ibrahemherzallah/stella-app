import axios from 'axios';
import type {
  RatesResponse,
  HistoryResponse,
  Offer,
  LoginRequest,
  LoginResponse,
  AdminProduct,
  Settings,
} from '../types';

const USE_MOCK = true;

const BASE_URL = 'https://api.myserver.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

const mockRatesData: RatesResponse = {
  lastUpdate: new Date().toISOString(),
  rates: [
    {
      label: 'سعر الذهب عيار 21 للشراء (بدون مصنعية)',
      value: 3250,
      currency: 'ج.م',
    },
    {
      label: 'سعر الذهب عيار 21 للبيع (بدون مصنعية)',
      value: 3200,
      currency: 'ج.م',
    },
    {
      label: 'سعر الذهب عيار 21 مع المصنعية',
      value: 3350,
      currency: 'ج.م',
    },
    {
      label: 'سعر الليرة الإنجليزي عيار 21',
      value: 26000,
      currency: 'ج.م',
    },
    {
      label: 'سعر الليرة الرشادي',
      value: 25500,
      currency: 'ج.م',
    },
  ],
};

const mockHistoryData: HistoryResponse = {
  karat: '21k',
  minPrice: 3100,
  maxPrice: 3300,
  data: [
    { date: '2024-01-01', price: 3100 },
    { date: '2024-01-08', price: 3150 },
    { date: '2024-01-15', price: 3180 },
    { date: '2024-01-22', price: 3200 },
    { date: '2024-01-29', price: 3220 },
    { date: '2024-02-05', price: 3250 },
    { date: '2024-02-12', price: 3280 },
    { date: '2024-02-19', price: 3300 },
  ],
};

const mockOffersData: Offer[] = [
  {
    id: '1',
    name: 'خاتم ذهب أنيق',
    karat: '21',
    originalPrice: 5000,
    discountedPrice: 4200,
    imageUrl: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg',
    description: 'خاتم ذهب عيار 21 بتصميم عصري',
    isActive: true,
  },
  {
    id: '2',
    name: 'سلسلة ذهب فاخرة',
    karat: '21',
    originalPrice: 12000,
    discountedPrice: 10500,
    imageUrl: 'https://images.pexels.com/photos/1721943/pexels-photo-1721943.jpeg',
    description: 'سلسلة ذهب عيار 21 بتصميم راقي',
    isActive: true,
  },
  {
    id: '3',
    name: 'أقراط ذهب كلاسيكية',
    karat: '18',
    originalPrice: 3500,
    discountedPrice: 3000,
    imageUrl: 'https://images.pexels.com/photos/1232931/pexels-photo-1232931.jpeg',
    description: 'أقراط ذهب عيار 18 بتصميم كلاسيكي',
    isActive: true,
  },
  {
    id: '4',
    name: 'دبلة زفاف ذهب',
    karat: '21',
    originalPrice: 4500,
    discountedPrice: 3800,
    imageUrl: 'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg',
    description: 'دبلة زفاف ذهب عيار 21',
    isActive: true,
  },
];

const mockAdminProducts: AdminProduct[] = mockOffersData.map((offer) => ({
  ...offer,
}));

export const getRates = async (): Promise<RatesResponse> => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockRatesData), 500);
    });
  }
  const response = await api.get<RatesResponse>('/public/rates');
  return response.data;
};

export const getHistory = async (karat: string): Promise<HistoryResponse> => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockHistoryData), 500);
    });
  }
  const response = await api.get<HistoryResponse>(
    `/public/rates/history?karat=${karat}`
  );
  return response.data;
};

export const getOffers = async (): Promise<Offer[]> => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockOffersData), 500);
    });
  }
  const response = await api.get<Offer[]>('/public/offers');
  return response.data;
};

export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  if (USE_MOCK) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (
          credentials.email === 'admin@stella.com' &&
          credentials.password === 'admin123'
        ) {
          resolve({
            token: 'mock-jwt-token-12345',
            user: {
              id: '1',
              email: 'admin@stella.com',
              name: 'Admin',
            },
          });
        } else {
          reject(new Error('بيانات الدخول غير صحيحة'));
        }
      }, 500);
    });
  }
  const response = await api.post<LoginResponse>('/admin/login', credentials);
  return response.data;
};

export const getAdminProducts = async (): Promise<AdminProduct[]> => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockAdminProducts), 500);
    });
  }
  const response = await api.get<AdminProduct[]>('/admin/products');
  return response.data;
};

export const createProduct = async (
  product: AdminProduct
): Promise<AdminProduct> => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      const newProduct = { ...product, id: Date.now().toString() };
      mockAdminProducts.push(newProduct);
      setTimeout(() => resolve(newProduct), 500);
    });
  }
  const response = await api.post<AdminProduct>('/admin/products', product);
  return response.data;
};

export const updateProduct = async (
  id: string,
  product: AdminProduct
): Promise<AdminProduct> => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      const index = mockAdminProducts.findIndex((p) => p.id === id);
      if (index !== -1) {
        mockAdminProducts[index] = { ...product, id };
      }
      setTimeout(() => resolve({ ...product, id }), 500);
    });
  }
  const response = await api.put<AdminProduct>(
    `/admin/products/${id}`,
    product
  );
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      const index = mockAdminProducts.findIndex((p) => p.id === id);
      if (index !== -1) {
        mockAdminProducts.splice(index, 1);
      }
      setTimeout(() => resolve(), 500);
    });
  }
  await api.delete(`/admin/products/${id}`);
};

let mockSettings: Settings = {
  buyMargin: 50,
  sellMargin: 30,
  makingFeePerGram: 100,
  rulesText: 'سعر الذهب يتغير يومياً حسب السوق العالمي.\nالأسعار المعروضة شاملة ضريبة القيمة المضافة.\nيمكنكم الاستفسار عن أي منتج عبر التواصل معنا.',
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
