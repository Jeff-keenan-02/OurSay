import { useState, useCallback, useEffect } from "react";
import { User } from "../../types/User";
import { API_BASE_URL } from "../../config/api";
import { PollGroup } from "../../types/PollGroup";

/**
 * Hook: useWeeklyPoll
 *
 * Fetches the weekly poll group for the logged-in user.
 * Returns a PollGroup (not a single poll).
 */
export function useWeeklyPoll(user: User | null) {
  const [weeklyPoll, setWeeklyPoll] = useState<PollGroup | null>(null);
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
        `${API_BASE_URL}/poll/weekly-poll?userId=${user.id}`
      );

      if (!res.ok) {
        throw new Error("Failed to load weekly poll");
      }

      const data: PollGroup | null = await res.json();
      setWeeklyPoll(data);

    } catch (err) {
      console.error("Error loading weekly poll:", err);
      setError("Could not load weekly poll");
      setWeeklyPoll(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadWeeklyPoll();
  }, [loadWeeklyPoll]);

  return {
    weeklyPoll,
    loading,
    error,
    reload: loadWeeklyPoll,
  };
}