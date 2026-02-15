// hooks/discussions/useDiscussion.ts

import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { DiscussionDetail } from "../../types/Discussion";
import { apiClient } from "../../services/apiClient";

/* =====================================================
   useDiscussion
   Fetches a single discussion detail
===================================================== */

export function useDiscussion(id: number) {
  /* -------------------------------------------------
     State
  --------------------------------------------------*/

  const [data, setData] = useState<DiscussionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* -------------------------------------------------
     Reload Function
  --------------------------------------------------*/

  const reload = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const json = await apiClient.get<DiscussionDetail>(
        `/discussions/${id}`
      );

      setData(json);

    } catch (err: any) {
      console.error("Failed to load discussion:", err);
      setError(err.message || "Could not load discussion");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  /* -------------------------------------------------
     Load On Mount
  --------------------------------------------------*/

  useEffect(() => {
    reload();
  }, [reload]);

  /* -------------------------------------------------
     Reload On Screen Focus
     (After voting or commenting)
  --------------------------------------------------*/

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

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