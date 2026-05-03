// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import {
  firebaseSignIn,
  firebaseLogout,
  firebaseChangePassword,
} from "../services/firebaseAuth";

interface User {
  id: string;
  email: string;
  role: string | null;
  active: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = "stella_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          const userRef = doc(db, "users", fbUser.uid);
          const userSnap = await getDoc(userRef);

          const role = userSnap.exists() ? userSnap.data().role ?? null : null;
          const active = userSnap.exists() ? userSnap.data().active ?? false : false;

          const u: User = {
            id: fbUser.uid,
            email: fbUser.email || "",
            role,
            active,
          };

          setUser(u);
          await SecureStore.setItemAsync(USER_KEY, JSON.stringify(u));
        } else {
          setUser(null);
          await SecureStore.deleteItemAsync(USER_KEY);
        }
      } catch (error) {
        console.error("Auth state error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    await firebaseSignIn(email, password);
  };

  const signOut = async () => {
    await firebaseLogout();
  };

  const changePassword = async ({
                                  currentPassword,
                                  newPassword,
                                }: {
    currentPassword: string;
    newPassword: string;
  }) => {
    await firebaseChangePassword(currentPassword, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: !!user && user.role === "admin" && user.active,
        signIn,
        signOut,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};