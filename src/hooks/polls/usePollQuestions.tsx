import { useState, useEffect } from "react";

export function usePollQuestions(API: string, topicId: number) {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!topicId) return;

    const loadPolls = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${API}/poll/polls-by-topic/${topicId}`
        );

        if (!res.ok) {
          throw new Error("Failed to load polls");
        }

        const data = await res.json();
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
  }, [API, topicId]);

  return { polls, loading, error };
}