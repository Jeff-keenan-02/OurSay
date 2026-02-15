// hooks/common/useTopics.ts

import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../../config/api";
import { Topic } from "../../types/Topic";

export function useTopics() {
  const [data, setData] = useState<Topic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/topics`);

      if (!res.ok) {
        throw new Error("Failed to fetch topics");
      }

      const json: Topic[] = await res.json();
      setData(json);

    } catch (err) {
      console.error("useTopics error:", err);
      setError("Failed to load topics");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    data,  
    loading,
    error,
    reload,
  };
}