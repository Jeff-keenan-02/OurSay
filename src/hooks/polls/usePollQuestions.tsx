import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/api";
import { Poll } from "../../types/Poll";

/**
 * usePollQuestions
 *
 * Fetches all individual poll questions belonging to a PollGroup.
 *
 * Used inside SwipePollScreen.
 *
 * Hierarchy:
 * Topic → PollGroup → Poll
 */

export function usePollQuestions(groupId: number | null) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) {
      setPolls([]);
      setLoading(false);
      return;
    }

    const loadPolls = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${API_BASE_URL}/poll/groups/${groupId}/polls`
        );

        if (!res.ok) {
          throw new Error("Failed to load polls");
        }

        const data: Poll[] = await res.json();
        setPolls(data);

      } catch (err) {
        console.error("Failed to load poll questions:", err);
        setPolls([]);
        setError("Could not load polls");
      } finally {
        setLoading(false);
      }
    };

    loadPolls();
  }, [groupId]);

  return { polls, loading, error };
}