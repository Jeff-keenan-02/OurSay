// hooks/polls/usePollQuestions.ts

import { useState, useEffect, useCallback } from "react";
import { Poll } from "../../types/Poll";
import { apiClient } from "../../services/apiClient";

/* =====================================================
   usePollQuestions
   Fetches all polls belonging to a PollGroup
===================================================== */

export function usePollQuestions(groupId: number | null) {
  const [data, setData] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* -------------------------------------------------
     Reload
  --------------------------------------------------*/

  const reload = useCallback(async () => {
    if (!groupId) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const json = await apiClient.get<Poll[]>(
        `/poll/groups/${groupId}/polls`
      );

      setData(Array.isArray(json) ? json : []);

    } catch (err: any) {
      console.error("Poll questions error:", err);

      setError(
        err.message || "Could not load polls"
      );

      setData([]);

    } finally {
      setLoading(false);
    }
  }, [groupId]);

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