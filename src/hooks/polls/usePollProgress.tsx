import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../../config/api";

/* -------------------------------------------------
   Normalized Frontend Type
--------------------------------------------------*/

type PollProgress = {
  status: 0 | 1 | 2;
  index: number; // frontend-friendly name
};

export function usePollProgress(
  groupId: number | null,
  user: { id: number } | null
) {
  const [data, setData] = useState<PollProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user?.id || !groupId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${API_BASE_URL}/poll/groups/${groupId}/progress?userId=${user.id}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch poll progress");
      }

      const json = await res.json();

      // NORMALIZE HERE
      setData({
        status: json.status,
        index: json.completed_polls,
      });

    } catch (err) {
      console.error("Failed to load poll progress:", err);
      setError("Could not load poll progress");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [groupId, user?.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}