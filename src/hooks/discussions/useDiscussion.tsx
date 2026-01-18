import { useState, useEffect, useCallback } from "react";

import { useFocusEffect } from "@react-navigation/native";
import { DiscussionDetail } from "../../types/DiscussionDetail";

export function useDiscussion(API: string, id: number) {
  const [discussion, setDiscussion] = useState<DiscussionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDiscussion = useCallback(async () => {
    try {
      const res = await fetch(`${API}/discussions/${id}`);
      const data = await res.json();
      setDiscussion(data);
    } catch (err) {
      console.error("Failed to load discussion:", err);
    } finally {
      setLoading(false);
    }
  }, [API, id]);

  useEffect(() => {
    loadDiscussion();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDiscussion();
    }, [])
  );

  return { discussion, loading, loadDiscussion };
}