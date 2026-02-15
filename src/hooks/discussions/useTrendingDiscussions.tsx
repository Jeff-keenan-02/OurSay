import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { API_BASE_URL } from "../../config/api";
import { DiscussionListItem } from "../../types/Discussion";

/**
 * useTrendingDiscussions
 *
 * Fetches trending discussions.
 *
 * Returns:
 * {
 *   data: DiscussionListItem[]
 *   loading: boolean
 *   error: string | null
 *   reload: () => Promise<void>
 *   updateData: (updater) => void   // for vote updates
 * }
 */

export function useTrendingDiscussions() {
  const [data, setData] = useState<DiscussionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${API_BASE_URL}/discussions/trending`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch trending discussions");
      }

      const json: DiscussionListItem[] = await res.json();
      setData(json);

    } catch (err) {
      console.error("Failed to load trending discussions", err);
      setError("Could not load trending discussions");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload automatically when screen regains focus
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  /**
   * Allows controlled updates (e.g. after vote)
   */
  const updateData = useCallback(
    (
      updater: (prev: DiscussionListItem[]) => DiscussionListItem[]
    ) => {
      setData(updater);
    },
    []
  );

  return { data, loading, error, reload, updateData };
}