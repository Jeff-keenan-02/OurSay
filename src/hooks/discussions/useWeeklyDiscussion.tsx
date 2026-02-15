// hooks/discussions/useWeeklyDiscussion.ts

import { useState, useEffect, useCallback } from "react";
import { WeeklyDiscussion } from "../../types/Discussion";
import { apiClient } from "../../services/apiClient";

/* =====================================================
   useWeeklyDiscussion
   Fetches the single weekly discussion
===================================================== */

export function useWeeklyDiscussion() {
  const [data, setData] = useState<WeeklyDiscussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* -------------------------------------------------
     Reload Function
  --------------------------------------------------*/

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const json =
        await apiClient.get<WeeklyDiscussion | null>(
          "/discussions/weekly"
        );

      setData(json);

    } catch (err: any) {
      console.error(
        "Failed to load weekly discussion:",
        err
      );

      setError(
        err.message || "Could not load weekly discussion"
      );

      setData(null);

    } finally {
      setLoading(false);
    }
  }, []);

  /* -------------------------------------------------
     Load On Mount
  --------------------------------------------------*/

  useEffect(() => {
    reload();
  }, [reload]);

  /* -------------------------------------------------
     Return
  --------------------------------------------------*/

  return { data, loading, error, reload };
}