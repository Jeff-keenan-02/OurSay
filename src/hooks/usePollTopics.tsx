import { useState, useCallback } from "react";
import { PollTopic } from "../types/Poll";

export function usePollTopics(API: string, user: any) {
  const [topics, setTopics] = useState<PollTopic[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTopics = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    try {
      const res = await fetch(`${API}/poll-topics?userId=${user.id}`);
      const data = await res.json();
      setTopics(data);
    } catch (err) {
      console.error("Error loading topics:", err);
    } finally {
      setLoading(false);
    }
  }, [API, user]);

  return { topics, loading, loadTopics };
}