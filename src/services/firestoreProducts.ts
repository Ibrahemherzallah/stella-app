// src/services/firestoreProducts.ts
import { db } from './firebase';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, updateDoc, where, } from 'firebase/firestore';

export type ProductDoc = {
  id: string;
  name: string;
  description?: string;
  karat: string;
  weightGrams: number;
  originalPriceIls: number;
  discountedPriceIls: number;
  imageUrl: string;
  isActive: boolean;
  soldOut: boolean;
  createdAt?: any;
  updatedAt?: any;
};

export type RegularProductDoc = {
  id: string;
  name: string;
  description?: string;
  karat: string;
  weightGrams: number;
  priceIls: number;
  imageUrl: string;
  isActive: boolean;
  updatedAt?: any;
};





const toNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const mapProductDoc = (id: string, data: any): ProductDoc => ({
  id,
  name: data?.name ?? '',
  description: data?.description ?? '',
  karat: data?.karat ?? '',
  weightGrams: toNumber(data?.weightGrams),
  originalPriceIls: toNumber(data?.originalPriceIls),
  discountedPriceIls: toNumber(data?.discountedPriceIls),
  imageUrl: data?.imageUrl ?? '',
  isActive: data?.isActive ?? true,
  soldOut: data.soldOut ?? false,
  createdAt: data?.createdAt,
  updatedAt: data?.updatedAt,
});

export const listProducts = async (): Promise<ProductDoc[]> => {
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  return snap.docs.map((d) => mapProductDoc(d.id, d.data()));
};

export const listActiveOffers = async (): Promise<ProductDoc[]> => {
  const products = await listProducts();
  return products.filter((item) => item.isActive === true);
};

export const deleteProductDoc = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'products', id));
};

export const getProductById = async (id: string): Promise<ProductDoc> => {
  const ref = doc(db, 'products', id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error('Product not found');
  }

  return mapProductDoc(snap.id, snap.data());
};

export const createProduct = async (
  data: Omit<ProductDoc, 'id'>
): Promise<string> => {
  const ref = await addDoc(collection(db, 'products'), {
    name: data.name ?? '',
    description: data.description ?? '',
    karat: data.karat ?? '',
    weightGrams: toNumber(data.weightGrams),
    originalPriceIls: toNumber(data.originalPriceIls),
    discountedPriceIls: toNumber(data.discountedPriceIls),
    imageUrl: data.imageUrl ?? '',
    isActive: data.isActive ?? true,
    createdAt: serverTimestamp(),
    soldOut: data.soldOut ?? false,
    updatedAt: serverTimestamp(),
  });

  return ref.id;
};

export const updateProduct = async (
  id: string,
  data: Partial<Omit<ProductDoc, 'id'>>
): Promise<void> => {
  const payload: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };

  if (data.name !== undefined) payload.name = data.name;
  if (data.description !== undefined) payload.description = data.description;
  if (data.karat !== undefined) payload.karat = data.karat;
  if (data.weightGrams !== undefined) payload.weightGrams = toNumber(data.weightGrams);
  if (data.originalPriceIls !== undefined) {
    payload.originalPriceIls = toNumber(data.originalPriceIls);
  }
  if (data.discountedPriceIls !== undefined) {
    payload.discountedPriceIls = toNumber(data.discountedPriceIls);
  }
  if (data.imageUrl !== undefined) payload.imageUrl = data.imageUrl;
  if (data.isActive !== undefined) payload.isActive = data.isActive;
  if (data.soldOut !== undefined) payload.soldOut = data.soldOut;

  await updateDoc(doc(db, 'products', id), payload);
};


export async function listAllRegularProducts(): Promise<RegularProductDoc[]> {
  const q = query(
    collection(db, 'regularProducts'),
    orderBy('updatedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as RegularProductDoc));
}

export async function listActiveRegularProducts(): Promise<RegularProductDoc[]> {
  const q = query(
    collection(db, 'regularProducts'),
    where('isActive', '==', true),
    // remove orderBy to avoid needing a composite index
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as RegularProductDoc));
}

export async function createRegularProduct(data: Omit<RegularProductDoc, 'id'>): Promise<void> {
  await addDoc(collection(db, 'regularProducts'), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function updateRegularProduct(id: string, data: Partial<RegularProductDoc>): Promise<void> {
  await updateDoc(doc(db, 'regularProducts', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteRegularProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, 'regularProducts', id));
}

export async function getRegularProductById(id: string): Promise<RegularProductDoc> {
  const snap = await getDoc(doc(db, 'regularProducts', id));
  if (!snap.exists()) throw new Error('Product not found');
  return { id: snap.id, ...snap.data() } as RegularProductDoc;
}