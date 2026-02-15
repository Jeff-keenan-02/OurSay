import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { DiscussionDetail } from "../../types/Discussion";
import { API_BASE_URL } from "../../config/api";

/**
 * useDiscussion
 *
 * Fetches a single discussion detail.
 *
 * Returns:
 * {
 *   data: DiscussionDetail | null
 *   loading: boolean
 *   error: string | null
 *   reload: () => Promise<void>
 * }
 */

export function useDiscussion(id: number) {
  const [data, setData] = useState<DiscussionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${API_BASE_URL}/discussions/${id}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch discussion");
      }

      const json: DiscussionDetail = await res.json();
      setData(json);

    } catch (err) {
      console.error("Failed to load discussion:", err);
      setError("Could not load discussion");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load on mount
  useEffect(() => {
    reload();
  }, [reload]);

  // Reload when screen regains focus
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return { data, loading, error, reload };
}