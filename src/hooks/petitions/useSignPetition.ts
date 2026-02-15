// hooks/petitions/useSignPetition.ts

import { useState, useCallback } from "react";
import { apiClient } from "../../services/apiClient";

/* =====================================================
   useSignPetition
   Handles petition signature mutation
===================================================== */

export function useSignPetition() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -------------------------------------------------
     Sign Mutation
  --------------------------------------------------*/

  const sign = useCallback(
    async (
      petitionId: number,
      userId: number
    ): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await apiClient.post(
          `/petitions/${petitionId}/sign`,
          { userId }
        );

        return true;

      } catch (err: any) {
        console.error("Sign petition error:", err);

        setError(
          err.message || "Could not sign petition"
        );

        return false;

      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* -------------------------------------------------
     Return
  --------------------------------------------------*/

  return { sign, loading, error };
}