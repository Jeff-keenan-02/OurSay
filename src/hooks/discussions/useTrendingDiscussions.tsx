import { useState, useEffect, useCallback } from "react";
import { Discussion } from "../../types/Discussion";
import { useFocusEffect } from "@react-navigation/native";

export  function useTrendingDiscussions(API: string) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);

  const loadDiscussions = async () => {
    const res = await fetch(`${API}/trendingdiscussions`);
    const data = await res.json();
    setDiscussions(data);
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