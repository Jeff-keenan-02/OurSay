import { useEffect, useState, useCallback } from "react";
import { API_BASE_URL } from "../../config/api";
import { Petition } from "../../types/Petition";

export function useTrendingPetition() {
  const [data, setData] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/petitions/trending`);

      if (!res.ok) {
        throw new Error("Failed to fetch trending petitions");
      }

      const json: Petition[] = await res.json();

      setData(json ?? []);

    } catch (err) {
      console.error("Failed to load trending petitions:", err);
      setError("Could not load trending petitions");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}