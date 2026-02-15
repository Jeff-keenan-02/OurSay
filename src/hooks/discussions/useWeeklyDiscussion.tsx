// hooks/discussions/useWeeklyDiscussion.ts

import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../../config/api";
import { WeeklyDiscussion } from "../../types/Discussion";

/**
 * useWeeklyDiscussion
 *
 * Fetches the single weekly discussion.
 *
 * Responsibilities:
 * - Fetch domain data only (no UI mapping)
 * - Expose loading + error state
 * - Provide reload() for manual refresh
 *
 * Used in:
 * - HomeScreen
 */

export function useWeeklyDiscussion() {
  const [data, setData] = useState<WeeklyDiscussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/discussions/weekly`);

      if (!res.ok) {
        throw new Error("Failed to fetch weekly discussion");
      }

      const json: WeeklyDiscussion | null = await res.json();
      setData(json);

    } catch (err) {
      console.error("Failed to load weekly discussion:", err);
      setError("Could not load weekly discussion");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}