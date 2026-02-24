// hooks/petitions/usePetitionsByTopic.ts

import { useState, useEffect, useCallback } from "react";
import { Petition } from "../../types/Petition";
import { useApiClient } from "../common/useApiClient";

/* =====================================================
   usePetitionsByTopic
   Fetches petitions belonging to a specific topic
===================================================== */

export function usePetitionsByTopic(topicId: number | null) {
  const [data, setData] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = useApiClient();

  /* -------------------------------------------------
     Reload Function
  --------------------------------------------------*/

  const reload = useCallback(async () => {
    if (!topicId) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const json =
        await api.get<Petition[]>(
          `/petitions/topics/${topicId}`
        );

      setData(Array.isArray(json) ? json : []);

    } catch (err: any) {
      console.error("Failed to load petitions:", err);

      setError(
        err.message || "Could not load petitions"
      );

      setData([]);

    } finally {
      setLoading(false);
    }
  }, [topicId]);

  /* -------------------------------------------------
     Load on Mount / Topic Change
  --------------------------------------------------*/

  useEffect(() => {
    reload();
  }, [reload]);

  /* -------------------------------------------------
     Return
  --------------------------------------------------*/

  return { data, loading, error, reload };
}