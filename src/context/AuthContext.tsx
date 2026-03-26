import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { firebaseSignIn, firebaseLogout } from "../services/firebaseAuth";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
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
          const u = { id: fbUser.uid, email: fbUser.email || "" };
          setUser(u);
          await SecureStore.setItemAsync(USER_KEY, JSON.stringify(u));
        } else {
          setUser(null);
          await SecureStore.deleteItemAsync(USER_KEY);
        }
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    console.log("email is: ", email)
    console.log("password is: ", password)
    await firebaseSignIn(email, password);
    // onAuthStateChanged will update user
  };

  const signOut = async () => {
    await firebaseLogout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signOut,
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