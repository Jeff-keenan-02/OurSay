// hooks/polls/usePollVote.ts

import { useState, useCallback } from "react";
import { User } from "../../types/User";
import { useApiClient } from "../common/useApiClient";

/* =====================================================
   usePollVote
   Submits a vote for a single poll
===================================================== */

export function usePollVote(user: User | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useApiClient();

  /* -------------------------------------------------
     Vote Mutation
  --------------------------------------------------*/

  const vote = useCallback(
    async (
      pollId: number,
      choice: "yes" | "no"
    ) => {
      if (!user?.id) {
        setError("User not logged in");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await api.post(
          `/poll/${pollId}/vote`,
          {
            userId: user.id,
            choice,
          }
        );

        return result;

      } catch (err: any) {
        console.error("Poll vote failed:", err);

        setError(
          err.message || "Failed to submit vote"
        );

      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  /* -------------------------------------------------
     Return
  --------------------------------------------------*/

  return { vote, loading, error };
}