import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";
import { mapPollToTrending } from "../../mappers/trendingCardMapper";
import { TrendingCardData } from "../../types/trendingCardData";

export function useTrendingPoll() {
  const [poll, setPoll] = useState<TrendingCardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/poll/trending`);
        const data = await res.json();

        if (data) {
          setPoll(mapPollToTrending(data));
        } else {
          setPoll(null);
        }
      } catch (err) {
        console.error("Failed to load trending poll", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { poll, loading };
}