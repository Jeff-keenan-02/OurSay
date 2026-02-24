import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types/User";
import { AuthResponse } from "../types/AuthResponse";

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (authData: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      const storedToken = await AsyncStorage.getItem("token");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }

      setLoading(false);
    };

    loadSession();
  }, []);

  const login = async (authData: AuthResponse) => {
    setUser(authData.user);
    setToken(authData.token);

    await AsyncStorage.setItem("user", JSON.stringify(authData.user));
    await AsyncStorage.setItem("token", authData.token);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);

    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
  };

  const updateUser = (partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;

      const updated = { ...prev, ...partial };
      AsyncStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, updateUser }} // ✅ include loading
    >
      {children}
    </AuthContext.Provider>
  );
};