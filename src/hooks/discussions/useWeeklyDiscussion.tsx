// hooks/discussions/useWeeklyDiscussion.ts

import { useState, useEffect, useCallback, useRef } from "react";
import { WeeklyDiscussion } from "../../types/Discussion";
import { useApiClient } from "../common/useApiClient";

/* =====================================================
   useWeeklyDiscussion
   Fetches the single weekly discussion
===================================================== */

export function useWeeklyDiscussion() {
  const [data, setData] = useState<WeeklyDiscussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = useApiClient();
  const initialized = useRef(false);

  /* -------------------------------------------------
     Reload Function
  --------------------------------------------------*/

  const reload = useCallback(async () => {
    try {
      if (!initialized.current) setLoading(true);
      setError(null);

      const json =
        await api.get<WeeklyDiscussion | null>(
          "/discussions/weekly"
        );

      setData(json);
      initialized.current = true;

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