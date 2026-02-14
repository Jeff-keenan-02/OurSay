import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";
import { mapWeeklyPetitionToCard } from "../../mappers/weeklyCardMapper";

export function useWeeklyPetition() {
  const [petition, setPetition] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/petitions/weekly`);
        const data = await res.json();

        if (data) {
          setPetition(mapWeeklyPetitionToCard(data));
        }
      } catch (err) {
        console.error("Failed to load weekly petition", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { petition, loading };
}