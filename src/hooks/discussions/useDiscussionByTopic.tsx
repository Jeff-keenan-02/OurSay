import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../../config/api";
import { DiscussionListItem } from "../../types/Discussion";

/**
 * useDiscussionByTopic
 *
 * Returns:
 * {
 *   data: DiscussionListItem[]
 *   loading: boolean
 *   error: string | null
 *   reload: () => Promise<void>
 *   updateData: (updater) => void   // optional for vote updates
 * }
 */

export function useDiscussionByTopic(topicId: number | null) {
  const [data, setData] = useState<DiscussionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!topicId) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${API_BASE_URL}/discussions/by-topic/${topicId}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch discussions");
      }

      const json: DiscussionListItem[] = await res.json();
      setData(json);

    } catch (err) {
      console.error("Failed to load topic discussions:", err);
      setError("Could not load discussions");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    reload();
  }, [reload]);

  /**
   * Controlled local updates (for voting)
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