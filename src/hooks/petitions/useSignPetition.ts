import { useState, useCallback } from "react";
import { API_BASE_URL } from "../../config/api";

/**
 * useSignPetition
 *
 * Submits a signature to backend.
 *
 * Returns:
 * {
 *   sign: (petitionId, userId) => Promise<boolean>
 *   loading: boolean
 *   error: string | null
 * }
 */

export function useSignPetition() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sign = useCallback(
    async (petitionId: number, userId: number) => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${API_BASE_URL}/petitions/${petitionId}/sign`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          }
        );

        if (!res.ok) {
          throw new Error("Failed to sign petition");
        }

        return true;

      } catch (err) {
        console.error("Sign petition error:", err);
        setError("Could not sign petition");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { sign, loading, error };
}