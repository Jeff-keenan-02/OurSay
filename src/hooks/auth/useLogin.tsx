import { useState, useCallback } from "react";
import { API_BASE_URL } from "../../config/api";
import { User } from "../../types/User";

/* =====================================================
   useLogin
   Handles user authentication
===================================================== */

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -------------------------------------------------
     Mutation
  --------------------------------------------------*/

  const login = useCallback(
    async (
      username: string,
      password: string
    ): Promise<User | null> => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${API_BASE_URL}/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
              password,
            }),
          }
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(
            json.error || "Invalid login"
          );
        }

        return json.user as User;

      } catch (err: any) {
        console.error("Login error:", err);
        setError(
          err?.message || "Network error"
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

  return { login, loading, error };
}