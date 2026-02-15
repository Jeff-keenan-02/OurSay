import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";
import { PollGroup } from "../../types/PollGroup";
import { User } from "../../types/User";

/**
 * usePollGroups
 *
 * Fetches all poll groups under a specific topic.
 *
 * Returns:
 * {
 *   data: PollGroup[]
 *   loading: boolean
 *   error: string | null
 *   reload: () => Promise<void>
 * }
 */

export function usePollGroups(
  user: User | null,
  topicId: number | null
) {
  const [data, setData] = useState<PollGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user?.id || !topicId) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${API_BASE_URL}/poll/topics/${topicId}/groups?userId=${user.id}`
      );

      if (!res.ok) {
        throw new Error("Failed to load poll groups");
      }

      const json: PollGroup[] = await res.json();
      setData(Array.isArray(json) ? json : []);

    } catch (err) {
      console.error("Error loading poll groups:", err);
      setError("Could not load poll groups");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, topicId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}