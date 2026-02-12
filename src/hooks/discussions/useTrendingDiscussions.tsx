import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { API_BASE_URL } from "../../config/api";
import { DiscussionListItem } from "../../types/Discussion";

/**
 * useTrendingDiscussions
 *
 * Fetch hook for retrieving trending discussions.
 *
 * Used in:
 * - HomeScreen
 * - DiscussionHomeScreen
 *
 * Automatically reloads when screen regains focus.
 */

export function useTrendingDiscussions() {
  const [discussions, setDiscussions] = useState<DiscussionListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDiscussions = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/discussions/trending`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch trending discussions");
      }

      const data: DiscussionListItem[] = await res.json();
      setDiscussions(data);

    } catch (err) {
      console.error("Failed to load trending discussions", err);
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload when screen regains focus
  useFocusEffect(
    useCallback(() => {
      loadDiscussions();
    }, [loadDiscussions])
  );

  return {
    discussions,
    setDiscussions, // exposed for vote updates
    loading,
    refresh: loadDiscussions,
  };
}