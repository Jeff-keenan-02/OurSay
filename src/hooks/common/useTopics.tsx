// hooks/common/useTopics.ts

import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../../config/api";
import { Topic } from "../../types/Topic";

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTopics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/topics`);

      if (!res.ok) {
        throw new Error("Failed to fetch topics");
      }

      const data: Topic[] = await res.json();
      setTopics(data);
    } catch (err) {
      console.error("Failed to load topics:", err);
      setError("Could not load topics");
      setTopics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  return { topics, loading, error, refresh: loadTopics };
}