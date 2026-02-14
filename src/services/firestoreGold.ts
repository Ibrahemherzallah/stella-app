import { db, storage } from './firebase'; // make sure you export these from firebase.ts
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export type GoldPricingSettings = {
  goldOunceUsd: number;
  premiumOunceUsd: number;
  usdToIls: number;
  usdToJod: number;
};

export type ProductConfig = {
  id: string;
  title: string;
  weightGrams: number;
  makingFeePerGramUsd: number;
  imageUrl?: string;
  isActive?: boolean;
  order?: number;
};

// ---------------- SETTINGS ----------------
export async function getTodaySettings(): Promise<GoldPricingSettings | null> {
  const snap = await getDoc(doc(db, 'settings', 'today'));
  if (!snap.exists()) return null;
  const d = snap.data() as any;
  return {
    goldOunceUsd: d.goldOunceUsd ?? 0,
    premiumOunceUsd: d.premiumOunceUsd ?? 0,
    usdToIls: d.usdToIls ?? 0,
    usdToJod: d.usdToJod ?? 0,
  };
}

export async function saveTodaySettings(payload: GoldPricingSettings) {
  console.log('saveTodaySettings', payload);
  await setDoc(
    doc(db, 'settings', 'today'),
    { ...payload, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// ---------------- ITEMS ----------------
export async function listItems(): Promise<ProductConfig[]> {
  const q = query(collection(db, 'items'), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  }));
}

export async function createItem(item: Omit<ProductConfig, 'id'>) {
  const refDoc = await addDoc(collection(db, 'items'), {
    ...item,
    updatedAt: serverTimestamp(),
  });
  return refDoc.id;
}

export async function updateItem(id: string, patch: Partial<ProductConfig>) {
  await updateDoc(doc(db, 'items', id), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function removeItem(id: string) {
  await deleteDoc(doc(db, 'items', id));
}

// ---------------- IMAGE UPLOAD ----------------
export async function uploadItemImage(localUri: string): Promise<string> {
  const res = await fetch(localUri);
  const blob = await res.blob();

  const fileName = `items/${Date.now()}-${Math.random().toString(16).slice(2)}.jpg`;
  const storageRef = ref(storage, fileName);

  await uploadBytes(storageRef, blob);
  return await getDownloadURL(storageRef);
}