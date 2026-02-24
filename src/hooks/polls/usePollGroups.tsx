// hooks/polls/usePollGroups.ts

import { useCallback, useEffect, useState } from "react";
import { PollGroup } from "../../types/PollGroup";
import { User } from "../../types/User";
import { useApiClient } from "../common/useApiClient";

/* =====================================================
   usePollGroups
   Fetches all poll groups under a topic
===================================================== */

export function usePollGroups(
  user: User | null,
  topicId: number | null
) {
  const [data, setData] = useState<PollGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = useApiClient();

  /* -------------------------------------------------
     Reload
  --------------------------------------------------*/

  const reload = useCallback(async () => {
    if (!user?.id || !topicId) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const json = await api.get<PollGroup[]>(
        `/poll/topics/${topicId}/groups?userId=${user.id}`
      );

      setData(Array.isArray(json) ? json : []);

    } catch (err: any) {
      console.error("Poll groups error:", err);

      setError(
        err.message || "Could not load poll groups"
      );

      setData([]);

    } finally {
      setLoading(false);
    }
  }, [user?.id, topicId]);

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