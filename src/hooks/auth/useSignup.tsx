// hooks/auth/useSignup.ts

import { useState, useCallback } from "react";
import { User } from "../../types/User";
import { apiClient } from "../../services/apiClient";

/* =====================================================
   useSignup
   Handles user registration mutation
===================================================== */

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -------------------------------------------------
     Mutation
  --------------------------------------------------*/

  const signup = useCallback(
    async (
      username: string,
      password: string
    ): Promise<User | null> => {
      try {
        setLoading(true);
        setError(null);

        const result = await apiClient.post<{
          user: User;
        }>("/auth/signup", {
          username,
          password,
        });

        return result.user;

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