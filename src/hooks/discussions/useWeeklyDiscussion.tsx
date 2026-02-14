// hooks/discussions/useWeeklyDiscussion.ts

import { useState, useCallback } from "react";
import { API_BASE_URL } from "../../config/api";
import { WeeklyDiscussion } from "../../types/Discussion";

export function useWeeklyDiscussion() {
  const [weeklyDiscussion, setWeekly] = useState<WeeklyDiscussion | null>(null);
  const [loading, setLoading] = useState(false);

  const loadWeekly = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/discussions/weekly`);
      const data = await res.json();
      setWeekly(data);
    } catch (err) {
      console.error("Failed to load weekly discussion:", err);
      setWeekly(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { weeklyDiscussion, loading, loadWeekly };
}