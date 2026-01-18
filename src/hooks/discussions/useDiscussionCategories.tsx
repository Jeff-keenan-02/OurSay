//useDisscusionCategoreis.tsx 
import { useState, useEffect } from "react";
import { DiscussionCategory } from "../../types/DiscussionCategory";


export function useDiscussionCategories(API: string) {
  const [categories, setCategories] = useState<DiscussionCategory[]>([]);
  const [loading, setLoading] = useState(true);

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