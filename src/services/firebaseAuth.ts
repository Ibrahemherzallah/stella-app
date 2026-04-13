import { signInWithEmailAndPassword, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential , signOut as fbSignOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export async function firebaseSignIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);

  // Ensure user profile exists (no manual collections needed)
  const uid = cred.user.uid;
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
1
  // Create user doc if not exist (role will be set manually OR bootstrap once)
  if (!snap.exists()) {
    await setDoc(userRef, { email, role: "admin" }, { merge: true });
    // ⚠️ If you want role NOT auto-set, remove role here and set it in console once.
  }

  return cred.user;
}

export async function firebaseLogout() {
  await fbSignOut(auth);
}

export const sendOTP = async (phoneNumber: string, appVerifier: any) => {
  return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
};

export const confirmOTP = async (verificationId: string, code: string) => {
  const credential = PhoneAuthProvider.credential(verificationId, code);
  return await signInWithCredential(auth, credential);
};