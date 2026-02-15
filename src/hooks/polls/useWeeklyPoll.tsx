import { useState, useCallback, useEffect } from "react";
import { User } from "../../types/User";
import { API_BASE_URL } from "../../config/api";
import { PollGroup } from "../../types/PollGroup";

/**
 * useWeeklyPoll
 *
 * Fetches the weekly poll group for the logged-in user.
 *
 * Returns:
 * {
 *   data: PollGroup | null
 *   loading: boolean
 *   error: string | null
 *   reload: () => Promise<void>
 * }
 */

export function useWeeklyPoll(user: User | null) {
  const [data, setData] = useState<PollGroup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${API_BASE_URL}/poll/weekly?userId=${user.id}`
      );

      if (!res.ok) {
        throw new Error("Failed to load weekly poll");
      }

      const json: PollGroup | null = await res.json();
      setData(json);

    } catch (err) {
      console.error("Error loading weekly poll:", err);
      setError("Could not load weekly poll");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}