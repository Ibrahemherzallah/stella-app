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
  createdAt?: any;
  updatedAt?: any;
};

export const listProducts = async () => {
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
};

export const deleteProductDoc = async (id: string) => {
  await deleteDoc(doc(db, 'products', id));
};
export const getProductById = async (id: string) => {
  const ref = doc(db, 'products', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Product not found');
  return { id: snap.id, ...(snap.data() as any) } as ProductDoc;
};

export const createProduct = async (data: Omit<ProductDoc, 'id'>) => {
  await addDoc(collection(db, 'products'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateProduct = async (id: string, data: Partial<Omit<ProductDoc, 'id'>>) => {
  await updateDoc(doc(db, 'products', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

