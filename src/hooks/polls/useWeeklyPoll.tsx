import { useState, useCallback } from "react";
import { User } from "../../types/User";
import { PollTopic } from "../../types/PollTopic";


export function useWeeklyPoll(API: string, user: User | null) {
  const [weeklyPoll, setWeeklyPoll] = useState<PollTopic | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeeklyPoll = useCallback(async () => {
    if (!user) {
      setWeeklyPoll(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${API}/poll/weekly-poll?userId=${user.id}`
      );

      if (!res.ok) {
        throw new Error("Failed to load weekly poll");
      }

      const data: PollTopic | null = await res.json();
      setWeeklyPoll(data);

    } catch (err) {
      console.error("Error loading weekly poll:", err);
      setError("Could not load weekly poll");
      setWeeklyPoll(null);
    } finally {
      setLoading(false);
    }
  }, [API, user]);

  return {
    weeklyPoll,
    loading,
    error,
    loadWeeklyPoll,
  };
}