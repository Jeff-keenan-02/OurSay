import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";

export function useTrendingPetition() {
  const [petitions, setPetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/petitions/trending`);
        const data = await res.json();

        setPetitions(data || []);
      } catch (err) {
        console.error("Failed to load trending petitions", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { petitions, loading };
}