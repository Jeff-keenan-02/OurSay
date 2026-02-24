// hooks/petitions/useWeeklyPetition.ts

import { useEffect, useState, useCallback } from "react";
import { Petition } from "../../types/Petition";
import { useApiClient } from "../common/useApiClient";

/* =====================================================
   useWeeklyPetition
   Fetches the single weekly petition
===================================================== */

export function useWeeklyPetition() {
  const [data, setData] = useState<Petition | null>(null);
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

      const json = await api.get<Petition | null>(
        "/petitions/weekly"
      );

      setData(json ?? null);

    } catch (err: any) {
      console.error("Weekly petition error:", err);

      setError(
        err.message || "Could not load weekly petition"
      );

      setData(null);

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