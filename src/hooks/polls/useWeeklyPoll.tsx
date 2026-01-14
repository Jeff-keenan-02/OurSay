import { useState, useCallback } from "react";

export function useWeeklyPoll(API: string, user: any) {
  const [weeklyPoll, setWeeklyPoll] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadWeeklyPoll = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const res = await fetch(`${API}/weekly-poll?userId=${user.id}`);
      const data = await res.json();
      setWeeklyPoll(data);
    } catch (err) {
      console.error("Error loading weekly poll:", err);
    } finally {
      setLoading(false);
    }
  }, [API, user]);

  return {
    weeklyPoll,
    loading,
    loadWeeklyPoll,
  };
}