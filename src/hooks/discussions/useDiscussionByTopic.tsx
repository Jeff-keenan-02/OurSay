// hooks/discussions/useDiscussionByTopic.ts

import { useState, useEffect, useCallback } from "react";
import { DiscussionListItem } from "../../types/Discussion";
import { apiClient } from "../../services/apiClient";

/* =====================================================
   useDiscussionByTopic
   Fetches discussions under a specific topic
===================================================== */

export function useDiscussionByTopic(topicId: number | null) {
  /* -------------------------------------------------
     State
  --------------------------------------------------*/

  const [data, setData] = useState<DiscussionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      const json = await apiClient.get<DiscussionListItem[]>(
        `/discussions/by-topic/${topicId}`
      );

      setData(json);

    } catch (err: any) {
      console.error("Failed to load topic discussions:", err);
      setError(err.message || "Could not load discussions");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  /* -------------------------------------------------
     Load On Mount / Topic Change
  --------------------------------------------------*/

  useEffect(() => {
    reload();
  }, [reload]);

  /* -------------------------------------------------
     Controlled Local Updates
     (Used for vote optimistic updates)
  --------------------------------------------------*/

  const updateData = useCallback(
    (
      updater: (prev: DiscussionListItem[]) => DiscussionListItem[]
    ) => {
      setData(updater);
    },
    []
  );

  /* -------------------------------------------------
     Return Standard Query Shape
  --------------------------------------------------*/

  return {
    data,
    loading,
    error,
    reload,
    updateData,
  };
}