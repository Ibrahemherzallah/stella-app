// src/services/goldSettingsService.ts

import { db, storage } from './firebase';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc,writeBatch } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { data } from 'browserslist';

// ---------------- TYPES ----------------

export type GoldSettings = {
  goldOunceUsd: number;
  premiumSellOunceUsd: number;
  premiumBuyOunceUsd: number;
  usdToJod: number;
  usdToIls: number;
  updatedAt?: any;
};

export type GoldItem = {
  id: string;
  title: string;
  imageUrl?: string;
  weightGrams: number;
  makingFeePerGramUsd: number;
  isActive: boolean;
  karat: '21' | '22' | '24';
  type: 'sell' | 'buy';
  order: number; // ← add this
  updatedAt?: any;
};

export type SocialMediaLinks = {
  whatsapp: string;
  instagram: string;
  tiktok: string;
  facebook: string;
};

export type PublicSettings = {
  socialMedia: SocialMediaLinks;
};

export type PublicRules = {
  rules: string[];
};


// ---------------- HELPERS ----------------

const toNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

// ---------------- SETTINGS ----------------

export async function getTodaySettings(): Promise<GoldSettings | null> {
  const snap = await getDoc(doc(db, 'settings', 'today'));

  if (!snap.exists()) return null;

  const data = snap.data() as any;

  return {
    goldOunceUsd: toNumber(data?.goldOunceUsd),
    premiumSellOunceUsd: toNumber(data?.premiumSellOunceUsd),
    premiumBuyOunceUsd: toNumber(data?.premiumBuyOunceUsd),
    usdToJod: toNumber(data?.usdToJod),
    usdToIls: toNumber(data?.usdToIls),
    updatedAt: data?.updatedAt,
  };
}

export async function saveTodaySettings(settings: GoldSettings): Promise<void> {
  await setDoc(
    doc(db, 'settings', 'today'),
    {
      goldOunceUsd: toNumber(settings.goldOunceUsd),
      premiumSellOunceUsd: toNumber(settings?.premiumSellOunceUsd),
      premiumBuyOunceUsd: toNumber(settings?.premiumBuyOunceUsd),
      usdToJod: toNumber(settings.usdToJod),
      usdToIls: toNumber(settings.usdToIls),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// ---------------- RULES ----------------

export async function getPublicSettings(): Promise<PublicSettings> {
  const snap = await getDoc(doc(db, 'public', 'settings'));

  if (!snap.exists()) {
    return {
      socialMedia: {
        whatsapp: '',
        instagram: '',
        tiktok: '',
        facebook: '',
      },
    };
  }

  const data = snap.data() as any;

  return {
    socialMedia: {
      whatsapp: data?.socialMedia?.whatsapp ?? '',
      instagram: data?.socialMedia?.instagram ?? '',
      tiktok: data?.socialMedia?.tiktok ?? '',
      facebook: data?.socialMedia?.facebook ?? '',
    },
  };
}

export async function savePublicSettings(payload: PublicSettings): Promise<void> {
  await setDoc(
    doc(db, 'public', 'settings'),
    {
      socialMedia: {
        whatsapp: payload.socialMedia?.whatsapp ?? '',
        instagram: payload.socialMedia?.instagram ?? '',
        tiktok: payload.socialMedia?.tiktok ?? '',
        facebook: payload.socialMedia?.facebook ?? '',
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getRulesList(): Promise<string[]> {
  const snap = await getDoc(doc(db, 'public', 'rules'));

  if (!snap.exists()) return [];

  const data = snap.data() as any;

  if (!Array.isArray(data?.rules)) return [];

  return data.rules
    .map((rule: unknown) => String(rule ?? '').trim())
    .filter(Boolean);
}

export async function saveRulesList(rules: string[]): Promise<void> {
  await setDoc(
    doc(db, 'public', 'rules'),
    {
      rules: rules
        .map((rule) => String(rule ?? '').trim())
        .filter(Boolean),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getRulesText(): Promise<string | null> {
  const snap = await getDoc(doc(db, 'public', 'rules'));

  if (!snap.exists()) return null;

  const data = snap.data() as any;
  return data?.rules ?? null;
}

// ---------------- ITEMS ----------------

export async function listItems(): Promise<GoldItem[]> {
  const snap = await getDocs(collection(db, 'items'));

  const items = snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      title: data?.title ?? '',
      imageUrl: data?.imageUrl ?? '',
      weightGrams: toNumber(data?.weightGrams),
      makingFeePerGramUsd: toNumber(data?.makingFeePerGramUsd),
      isActive: data?.isActive ?? true,
      type: data?.type ?? 'buy',
      karat: data?.karat ?? '21',
      order: data?.order, // may be undefined
      updatedAt: data?.updatedAt,
    } as GoldItem & { order?: number };
  });

  // Sort: items with 'order' come first (ascending), items without it
  // fall back to updatedAt ascending, placed after ordered items.
  items.sort((a: any, b: any) => {
    const aHasOrder = a.order !== undefined;
    const bHasOrder = b.order !== undefined;

    if (aHasOrder && bHasOrder) return a.order - b.order;
    if (aHasOrder && !bHasOrder) return -1;
    if (!aHasOrder && bHasOrder) return 1;

    const aTime = a.updatedAt?.toMillis?.() ?? 0;
    const bTime = b.updatedAt?.toMillis?.() ?? 0;
    return aTime - bTime;
  });

  // ensure order is always a number for type consistency
  return items.map((it: any) => ({ ...it, order: it.order ?? 0 }));
}

// Persist the full order of items based on their array position
export async function reorderItems(items: GoldItem[]): Promise<void> {
  const batch = writeBatch(db);

  items.forEach((item, index) => {
    batch.update(doc(db, 'items', item.id), { order: index });
  });

  await batch.commit();
}


export async function updateItem(itemId: string, patch: Partial<GoldItem>): Promise<void> {
  const payload: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };

  if (patch.title !== undefined) payload.title = patch.title;
  if (patch.imageUrl !== undefined) payload.imageUrl = patch.imageUrl;
  if (patch.weightGrams !== undefined) payload.weightGrams = toNumber(patch.weightGrams);
  if (patch.makingFeePerGramUsd !== undefined) {
    payload.makingFeePerGramUsd = toNumber(patch.makingFeePerGramUsd);
  }
  if (patch.isActive !== undefined) payload.isActive = patch.isActive;
  if (patch.type !== undefined) payload.type = patch.type;

  await updateDoc(doc(db, 'items', itemId), payload);
}

export async function deleteItem(itemId: string): Promise<void> {
  await deleteDoc(doc(db, 'items', itemId));
}

// ---------------- IMAGE UPLOAD ----------------

export async function uploadItemImage(localUri: string): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();

  const fileName = `items/${Date.now()}-${Math.random().toString(16).slice(2)}.jpg`;
  const storageRef = ref(storage, fileName);

  await uploadBytes(storageRef, blob);
  return await getDownloadURL(storageRef);
}