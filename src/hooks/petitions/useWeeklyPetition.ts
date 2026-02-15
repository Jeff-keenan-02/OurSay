import { useEffect, useState, useCallback } from "react";
import { API_BASE_URL } from "../../config/api";
import { Petition } from "../../types/Petition";

export function useWeeklyPetition() {
  const [data, setData] = useState<Petition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/petitions/weekly`);

      if (!res.ok) {
        throw new Error("Failed to fetch weekly petition");
      }

      const json: Petition | null = await res.json();

      setData(json ?? null);

    } catch (err) {
      console.error("Failed to load weekly petition:", err);
      setError("Could not load weekly petition");
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