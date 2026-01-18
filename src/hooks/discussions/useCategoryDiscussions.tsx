import { useState, useEffect, useCallback } from "react";
import { Discussion } from "../../types/Discussion";


export function useCategoryDiscussions(
  API: string,
  categoryId: number | null
) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDiscussions = useCallback(async () => {
    if (!categoryId) {
      setDiscussions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API}/discussions/by-category/${categoryId}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch discussions");
      }

      const data = await res.json();
      setDiscussions(data);
    } catch (err) {
      console.error("Failed to load category discussions:", err);
      setError("Could not load discussions");
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  }, [API, categoryId]);

  useEffect(() => {
    loadDiscussions();
  }, [loadDiscussions]);

  return {
    discussions,
    loading,
    error,
    loadDiscussions,
  };
}