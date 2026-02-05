//useDisscusionCategoreis.tsx 
import { useState, useEffect } from "react";
import { DiscussionCategory } from "../../types/DiscussionCategory";
import { API_BASE_URL } from "../../config/api";


export function useDiscussionCategories() {
  const [categories, setCategories] = useState<DiscussionCategory[]>([]);
  const [loading, setLoading] = useState(true);
    const API = API_BASE_URL;

  const loadCategories = async () => {
    try {
      const res = await fetch(`${API}/discussions/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      console.error("Failed to load categories:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return { categories, loading, loadCategories };
}