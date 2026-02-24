// hooks/discussions/useTrendingDiscussions.ts

import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { DiscussionListItem } from "../../types/Discussion";
import { useApiClient } from "../common/useApiClient";

/* =====================================================
   useTrendingDiscussions
   Fetches trending discussions list
===================================================== */

export function useTrendingDiscussions() {
  const [data, setData] = useState<DiscussionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = useApiClient();

  /* -------------------------------------------------
     Reload Function
  --------------------------------------------------*/

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const json = await api.get<DiscussionListItem[]>(
        "/discussions/trending"
      );

      setData(json ?? []);

    } catch (err: any) {
      console.error("Failed to load trending discussions:", err);
      setError(err.message || "Could not load trending discussions");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* -------------------------------------------------
     Auto Reload on Screen Focus
  --------------------------------------------------*/

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  /* -------------------------------------------------
     Controlled Local Updates
     (Used for vote mutations)
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
     Return
  --------------------------------------------------*/

  return { data, loading, error, reload, updateData };
}