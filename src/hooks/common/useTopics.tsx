// hooks/common/useTopics.ts

import { useState, useEffect, useCallback } from "react";
import { Topic } from "../../types/Topic";
import { useApiClient } from "../common/useApiClient";

/* =====================================================
   useTopics
   Fetches all available topics
===================================================== */

export function useTopics() {
  /* -------------------------------------------------
     State
  --------------------------------------------------*/

  const [data, setData] = useState<Topic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const api = useApiClient();

  /* -------------------------------------------------
     Reload Function
  --------------------------------------------------*/

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const json = await api.get<Topic[]>("/topics");

      setData(json);

    } catch (err: any) {
      console.error("useTopics error:", err);
      setError(err.message || "Failed to load topics");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* -------------------------------------------------
     Load On Mount
  --------------------------------------------------*/

  useEffect(() => {
    reload();
  }, [reload]);

  /* -------------------------------------------------
     Return Standard Query Shape
  --------------------------------------------------*/

  return {
    data,
    loading,
    error,
    reload,
  };
}