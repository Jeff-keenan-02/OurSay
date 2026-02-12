import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";
import { PollGroup } from "../../types/PollGroup";
import { User } from "../../types/User";

/**
 * usePollGroups
 *
 * Fetches all poll groups under a specific topic.
 * Includes user-specific progress information.
 *
 * Used in:
 * - PollGroupsScreen
 *
 * Hierarchy:
 * Topic → PollGroup → Poll
 */

export function usePollGroups(
  user: User | null,
  topicId: number | null
) {
  const [groups, setGroups] = useState<PollGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    if (!user || !topicId) {
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/poll/topics/${topicId}/groups?userId=${user.id}`
      );

      if (!res.ok) {
        throw new Error("Failed to load poll groups");
      }

      const data: PollGroup[] = await res.json();
      setGroups(data);

    } catch (err) {
      console.error("Error loading poll groups:", err);
      setGroups([]);
      setError("Could not load poll groups");
    } finally {
      setLoading(false);
    }
  }, [user, topicId]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return { groups, loading, error, loadGroups };
}