// hooks/petitions/usePetition.ts

import { useState, useEffect, useCallback } from "react";
import { Petition } from "../../types/Petition";
import { useApiClient } from "../common/useApiClient";

/* =====================================================
   usePetition
   Fetches a single petition by ID
===================================================== */

export function usePetition(petitionId: number | null) {
  const [data, setData] = useState<Petition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = useApiClient();

  /* -------------------------------------------------
     Reload Function
  --------------------------------------------------*/

  const reload = useCallback(async () => {
    if (!petitionId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const json =
        await api.get<Petition>(
          `/petitions/${petitionId}`
        );

      setData(json);

    } catch (err: any) {
      console.error("Failed to load petition:", err);

      setError(
        err.message || "Could not load petition"
      );

      setData(null);

    } finally {
      setLoading(false);
    }
  }, [petitionId]);

  /* -------------------------------------------------
     Load On Mount / ID Change
  --------------------------------------------------*/

  useEffect(() => {
    reload();
  }, [reload]);

  /* -------------------------------------------------
     Return
  --------------------------------------------------*/

  return { data, loading, error, reload };
}