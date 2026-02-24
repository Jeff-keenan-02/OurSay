// hooks/auth/useSignup.ts

import { useState, useCallback } from "react";
import { AuthResponse } from "../../types/AuthResponse";
import { useApiClient } from "../common/useApiClient";

/* =====================================================
   useSignup
   Handles user registration mutation
===================================================== */

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const api = useApiClient();

  /* -------------------------------------------------
     Mutation
  --------------------------------------------------*/

  const signup = useCallback(
    async (
      username: string,
      password: string
    ): Promise<AuthResponse | null> => {
      try {
        setLoading(true);
        setError(null);

        const result = await api.post<AuthResponse>(
          "/auth/signup",
          { username, password }
        );

        return result;

      } catch (err: any) {
        console.error("Signup error:", err);

        setError(
          err.message || "Signup failed"
        );

        return null;

      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* -------------------------------------------------
     Return
  --------------------------------------------------*/

  return { signup, loading, error };
}