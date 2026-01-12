import { useState, useEffect, useCallback } from "react";
import { Discussion } from "../types/Discussion";
import { useFocusEffect } from "@react-navigation/native";

export  function useTrendingDiscussions(API: string) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);

  const loadDiscussions = async () => {
    try {
      const res = await fetch(`${API}/trendingdiscussions`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setDiscussions(data);
      } else if (data && Array.isArray((data as any).rows)) {
        setDiscussions((data as any).rows);
      } else {
        console.warn("useTrendingDiscussions: unexpected response shape", data);
        setDiscussions([]);
      }
    } catch (err) {
      console.error("Failed to load trending discussions:", err);
      setDiscussions([]);
    }
  };

  useEffect(() => {
    loadDiscussions();
  }, []);

  
  useFocusEffect(
    useCallback(() => {
      loadDiscussions();
    }, [])
  );

  return { discussions, setDiscussions, loadDiscussions };
}
