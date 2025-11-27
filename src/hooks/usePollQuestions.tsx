import { useState, useEffect } from "react";

export function usePollQuestions(API: string, topicId: number) {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/polls-by-topic/${topicId}`)
      .then(res => res.json())
      .then(data => setPolls(data))
      .finally(() => setLoading(false));
  }, [topicId]);

  return { polls, loading };
}