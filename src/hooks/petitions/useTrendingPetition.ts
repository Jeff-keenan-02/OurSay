// hooks/petitions/useTrendingPetition.ts

import { useState, useEffect, useCallback } from "react";
import { Petition } from "../../types/Petition";
import { useApiClient } from "../common/useApiClient";

/* =====================================================
   useTrendingPetition
   Fetches trending petitions
===================================================== */

export function useTrendingPetition() {
  const [data, setData] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = useApiClient();

  /* -------------------------------------------------
     Reload
  --------------------------------------------------*/

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const json = await api.get<Petition[]>(
        "/petitions/trending"
      );

      setData(json ?? []);

    } catch (err: any) {
      console.error("Trending petitions error:", err);

      setError(
        err.message || "Could not load trending petitions"
      );

      setData([]);

    } finally {
      setLoading(false);
    }
  }, []);

  /* -------------------------------------------------
     Initial Load
  --------------------------------------------------*/

  useEffect(() => {
    reload();
  }, [reload]);

  /* -------------------------------------------------
     Return
  --------------------------------------------------*/

  return { data, loading, error, reload };
}