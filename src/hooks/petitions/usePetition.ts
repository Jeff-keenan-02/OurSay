import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../../config/api";
import { Petition } from "../../types/Petition";

/**
 * usePetition
 *
 * Fetches a single petition by ID.
 *
 * Returns:
 * {
 *   data: Petition | null
 *   loading: boolean
 *   error: string | null
 *   reload: () => Promise<void>
 * }
 */

export function usePetition(petitionId: number | null) {
  const [data, setData] = useState<Petition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!petitionId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${API_BASE_URL}/petitions/${petitionId}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch petition");
      }

      const json: Petition = await res.json();
      setData(json);

    } catch (err) {
      console.error("Failed to load petition:", err);
      setError("Could not load petition");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [petitionId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}