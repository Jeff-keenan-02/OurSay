// hooks/petitions/useSignPetition.ts

import { useState, useCallback } from "react";
import { useApiClient } from "../common/useApiClient";

/* =====================================================
   useSignPetition
   Handles petition signature mutation
===================================================== */

export function useSignPetition() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const api = useApiClient();
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

        await api.post(
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