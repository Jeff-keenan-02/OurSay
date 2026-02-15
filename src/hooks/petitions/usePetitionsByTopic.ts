import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../../config/api";
import { Petition } from "../../types/Petition";

/**
 * usePetitionsByTopic
 *
 * Fetches petitions belonging to a specific topic.
 *
 * Returns:
 * {
 *   data: Petition[]
 *   loading: boolean
 *   error: string | null
 *   reload: () => Promise<void>
 * }
 */

export function usePetitionsByTopic(topicId: number | null) {
  const [data, setData] = useState<Petition[]>([]);
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
        `${API_BASE_URL}/petitions/topics/${topicId}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch petitions");
      }

      const json: Petition[] = await res.json();
      setData(json);

    } catch (err) {
      console.error("Failed to load petitions:", err);
      setError("Could not load petitions");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}