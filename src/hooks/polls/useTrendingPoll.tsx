import { useEffect, useState, useContext, useCallback } from "react";
import { API_BASE_URL } from "../../config/api";
import { PollGroup } from "../../types/PollGroup";
import { User } from "../../types/User";

export function useTrendingPoll(user: User | null) {
  const [data, setData] = useState<PollGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user?.id) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${API_BASE_URL}/poll/trending?userId=${user.id}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch trending polls");
      }

      const json: PollGroup[] = await res.json();
      setData(Array.isArray(json) ? json : []);

    } catch (err) {
      console.error("Failed to load trending polls", err);
      setError("Could not load trending polls");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}