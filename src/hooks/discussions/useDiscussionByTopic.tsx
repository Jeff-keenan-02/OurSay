import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../../config/api";
import { DiscussionListItem } from "../../types/Discussion";

/**
 * useDiscussionByTopic
 *
 * Fetches ALL discussions under a specific topic.
 *
 * Used in:
 * - DiscussionsListScreen (when user taps a topic)
 *
 * Backend route:
 * GET /discussions/by-topic/:topicId
 *
 * Behaviour:
 * - If topicId is null → returns empty array
 * - Loads automatically when topicId changes
 * - Exposes loadDiscussions() for manual refresh
 *
 * @param topicId - ID of selected topic
 */

export function useDiscussionByTopic(
  topicId: number | null
) {

  const [discussions, setDiscussions] = useState<DiscussionListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDiscussions = useCallback(async () => {
    if (!topicId) {
      setDiscussions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/discussions/by-topic/${topicId}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch discussions");
      }

      const data = await res.json();
      setDiscussions(data);
    } catch (err) {
      console.error("Failed to load topic discussions:", err);
      setError("Could not load discussions");
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, topicId]);

  useEffect(() => {
    loadDiscussions();
  }, [loadDiscussions]);

  return {
    discussions,
    loading,
    error,
    setDiscussions,
    loadDiscussions,
  };
}