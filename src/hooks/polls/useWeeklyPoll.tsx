// hooks/polls/useWeeklyPoll.ts

import { useState, useCallback, useEffect } from "react";
import { User } from "../../types/User";
import { PollGroup } from "../../types/PollGroup";
import { useApiClient } from "../common/useApiClient";

/* =====================================================
   useWeeklyPoll
   Fetches weekly poll group for logged-in user
===================================================== */

export function useWeeklyPoll(user: User | null) {
  const [data, setData] = useState<PollGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = useApiClient();
  /* -------------------------------------------------
     Reload
  --------------------------------------------------*/

  const reload = useCallback(async () => {
    if (!user?.id) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const json = await api.get<PollGroup | null>(
        `/poll/weekly?userId=${user.id}`
      );

      setData(json ?? null);

    } catch (err: any) {
      console.error("Error loading weekly poll:", err);

      setError(
        err.message || "Could not load weekly poll"
      );

      setData(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /* -------------------------------------------------
     Auto Load
  --------------------------------------------------*/

  useEffect(() => {
    reload();
  }, [reload]);

  /* -------------------------------------------------
     Return
  --------------------------------------------------*/

  return { data, loading, error, reload };
}