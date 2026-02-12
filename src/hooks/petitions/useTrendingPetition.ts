import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";
import { mapPetitionToTrending } from "../../mappers/trendingCardMapper";

export function useTrendingPetition() {
  const [petition, setPetition] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/petitions/trending`);
        const data = await res.json();

        if (data) {
          setPetition(mapPetitionToTrending(data));
        }
      } catch (err) {
        console.error("Failed to load trending petition", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { petition, loading };
}