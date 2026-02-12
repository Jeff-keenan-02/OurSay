import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VerificationTier } from "../types/VerificationTier";


type User = {
  id: number;
  username: string;
  verification_tier: VerificationTier;
};

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  // Incremental updates
  updateUser: (partial: Partial<User>) => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    };
    loadUser();
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("user");
  };

  const updateUser = (partial: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};