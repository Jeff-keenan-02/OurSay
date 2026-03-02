// hooks/polls/usePollVote.ts

import { useState, useCallback } from "react";
import { useApiClient } from "../common/useApiClient";

/* =====================================================
   usePollVote
   Submits a vote for a single poll
===================================================== */

export function usePollVote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useApiClient();

  const vote = useCallback(
    async (pollId: number, choice: "yes" | "no") => {
      try {
        setLoading(true);
        setError(null);

        const result = await api.post(
          `/poll/${pollId}/vote`,
          { choice }
        );

        return result;

      } catch (err: any) {
        console.error("Poll vote failed:", err);
        setError(err.message || "Failed to submit vote");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { vote, loading, error };
}