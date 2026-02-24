import { useState, useCallback } from "react";
import { AuthResponse } from "../../types/AuthResponse";
import { useApiClient } from "../common/useApiClient";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useApiClient();

  const login = useCallback(
    async (
      username: string,
      password: string
    ): Promise<AuthResponse | null> => {

      try {
        setLoading(true);
        setError(null);

        const result = await api.post<AuthResponse>("/auth/login",{ username, password });

        return result;

      } catch (err: any) {
        console.error("Login error:", err);
        setError(err.message || "Login failed");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { login, loading, error };
}