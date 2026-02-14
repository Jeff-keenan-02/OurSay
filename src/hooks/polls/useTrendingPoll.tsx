import { useEffect, useState, useContext } from "react";
import { API_BASE_URL } from "../../config/api";
import { mapPollToTrending } from "../../mappers/trendingCardMapper";
import { TrendingCardData } from "../../types/trendingCardData";
import { AuthContext } from "../../context/AuthContext";

export function useTrendingPoll() {
  const { user } = useContext(AuthContext);

  const [polls, setPolls] = useState<TrendingCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/poll/trending?userId=${user.id}`
        );

        const data = await res.json();

        if (Array.isArray(data)) {
          const mapped = data.map(mapPollToTrending);
          setPolls(mapped);
        } else {
          setPolls([]);
        }
      } catch (err) {
        console.error("Failed to load trending polls", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  return { polls, loading };
}