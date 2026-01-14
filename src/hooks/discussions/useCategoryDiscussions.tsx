// hooks/useCategoryDiscussions.tsx
import { useState, useEffect, useCallback } from "react";
import { Discussion } from "../types/Discussion";

export function useCategoryDiscussions(API: string, categoryId: number | null) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDiscussions = useCallback(async () => {
    if (!categoryId) return;

    try {
      const res = await fetch(`${API}/discussions/by-category/${categoryId}`);
      const data = await res.json();
      setDiscussions(data);
    } catch (err) {
      console.error("Failed to load category discussions:", err);
    } finally {
      setLoading(false);
    }
  }, [API, categoryId]);

  useEffect(() => {
    setLoading(true);
    loadDiscussions();
  }, [loadDiscussions]);

  return { discussions, loading, loadDiscussions, setDiscussions };
}