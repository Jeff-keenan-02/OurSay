// hooks/polls/useTrendingPoll.ts

import { useState, useEffect, useCallback, useRef } from "react";
import { PollGroup } from "../../types/PollGroup";
import { User } from "../../types/User";
import { useApiClient } from "../common/useApiClient";

/* =====================================================
   useTrendingPoll
   Fetches trending poll groups for logged-in user
===================================================== */

export function useTrendingPoll(user: User | null) {
  const [data, setData] = useState<PollGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = useApiClient();
  const initialized = useRef(false);

  /* -------------------------------------------------
     Reload
  --------------------------------------------------*/

  const reload = useCallback(async () => {
    if (!user?.id) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      if (!initialized.current) setLoading(true);
      setError(null);

      const json = await api.get<PollGroup[]>(
        `/poll/trending?userId=${user.id}`
      );

      setData(Array.isArray(json) ? json : []);
      initialized.current = true;

    } catch (err: any) {
      console.error("Failed to load trending polls:", err);

      setError(
        err.message || "Could not load trending polls"
      );

      setData([]);
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