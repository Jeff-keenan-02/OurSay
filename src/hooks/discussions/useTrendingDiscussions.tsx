import { useState, useEffect, useCallback } from "react";
import { Discussion } from "../../types/Discussion";
import { useFocusEffect } from "@react-navigation/native";
import { API_BASE_URL } from "../../config/api";

export  function useTrendingDiscussions() {
    const API = API_BASE_URL;
  const [discussions, setDiscussions] = useState<Discussion[]>([]);

  const loadDiscussions = async () => {
    const res = await fetch(`${API}/discussions/trending`);
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