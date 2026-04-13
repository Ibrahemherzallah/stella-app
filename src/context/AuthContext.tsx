import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { sendOTP, confirmOTP } from "../services/firebaseAuth";

interface User {
  id: string;
  phone: string | null;
}

interface AuthContextType {
  user: User | null;
  role: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sendPhoneOTP: (phone: string, verifier: any) => Promise<void>;
  verifyOTP: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationId, setVerificationId] = useState<string | null>(null);

  const sendPhoneOTP = async (phone: string, verifier: any) => {
    const confirmation = await sendOTP(phone, verifier);
    setVerificationId(confirmation.verificationId);
  };

  const verifyOTP = async (code: string) => {
    if (!verificationId) throw new Error("No verification ID");
    await confirmOTP(verificationId, code);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          const u = {
            id: fbUser.uid,
            phone: fbUser.phoneNumber || null,
          };
          setUser(u);

          const userRef = doc(db, "users", fbUser.uid);
          const snap = await getDoc(userRef);

          if (!snap.exists()) {
            // 🔐 create user WITHOUT admin role
            await setDoc(userRef, {
              phone: fbUser.phoneNumber,
              role: "user", // default
            });
            setRole("user");
          } else {
            setRole(snap.data().role || null);
          }
        } else {
          setUser(null);
          setRole(null);
        }
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const signOut = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        isAuthenticated: !!user,
        sendPhoneOTP,
        verifyOTP,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};