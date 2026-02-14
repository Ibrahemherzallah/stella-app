import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc, } from "firebase/firestore";
import { db } from "./firebase";

export type GoldSettings = {
  goldOunceUsd: number;
  premiumOunceUsd: number;
  usdToJod: number;
  usdToIls: number;
  updatedAt?: any;
};

export type GoldItem = {
  id?: string;
  title: string;
  imageUrl?: string;
  weightGrams: number;
  makingFeePerGramUsd: number;
  isActive: boolean;
  order: number;
  updatedAt?: any;
};

// ---------- SETTINGS ----------
export async function saveTodaySettings(settings: GoldSettings) {
  await setDoc(
    doc(db, "settings", "today"),
    { ...settings, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function getTodaySettings(): Promise<GoldSettings | null> {
  const snap = await getDoc(doc(db, "settings", "today"));
  return snap.exists() ? (snap.data() as GoldSettings) : null;
}

// ---------- PUBLIC RULES ----------
export async function saveRulesText(rulesText: string) {
  await setDoc(
    doc(db, "public", "rules"),
    { rulesText, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function getRulesText(): Promise<string | null> {
  const snap = await getDoc(doc(db, "public", "rules"));
  if (!snap.exists()) return null;
  return (snap.data() as any).rulesText ?? null;
}

// ---------- ITEMS ----------
export async function createItem(item: GoldItem) {
  const ref = await addDoc(collection(db, "items"), {
    ...item,
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateItem(itemId: string, patch: Partial<GoldItem>) {
  await updateDoc(doc(db, "items", itemId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteItem(itemId: string) {
  await deleteDoc(doc(db, "items", itemId));
}

export async function listItems(): Promise<GoldItem[]> {
  const q = query(collection(db, "items"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as GoldItem) }));
}