// hooks/auth/useLogin.ts

import { useState, useCallback } from "react";
import { User } from "../../types/User";
import { apiClient } from "../../services/apiClient";

/* =====================================================
   useLogin
   Handles user authentication mutation
===================================================== */

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (
      username: string,
      password: string
    ): Promise<User | null> => {

      try {
        setLoading(true);
        setError(null);

        const result = await apiClient.post<{
          user: User;
        }>("/auth/login", {
          username,
          password,
        });

        return result.user;

      } catch (err: any) {
        console.error("Login error:", err);

        setError(
          err.message || "Login failed"
        );

        return null;

      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { login, loading, error };
}