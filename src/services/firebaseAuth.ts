// src/services/firebaseAuth.ts
import { signInWithEmailAndPassword, signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword, } from "firebase/auth";
import { auth } from "./firebase";

export const firebaseSignIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const firebaseLogout = async () => {
  return await signOut(auth);
};

export const firebaseChangePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const user = auth.currentUser;

  if (!user || !user.email) {
    throw new Error("المستخدم غير مسجل الدخول");
  }

  const credential = EmailAuthProvider.credential(user.email, currentPassword);

  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
};