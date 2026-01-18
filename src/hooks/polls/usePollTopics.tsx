import { useState, useCallback, useEffect } from "react";
import { PollTopic } from "../../types/PollTopic";
import { User } from "../../types/User";

export function usePollTopics(API: string, user: User | null) {
  const [topics, setTopics] = useState<PollTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTopics = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API}/poll/poll-topics?userId=${user.id}`
      );

      if (!res.ok) {
        throw new Error("Failed to load poll topics");
      }

      const data: PollTopic[] = await res.json();
      setTopics(data);

    } catch (err) {
      console.error("Error loading topics:", err);
      setTopics([]);
      setError("Could not load poll topics");
    } finally {
      setLoading(false);
    }
  }, [API, user]);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  return { topics, loading, error, loadTopics };
}