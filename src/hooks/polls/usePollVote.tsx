import { useState, useCallback } from "react";
import { API_BASE_URL } from "../../config/api";
import { User } from "../../types/User";

/**
 * usePollVote
 *
 * Submits a vote for a single poll.
 *
 * Returns:
 * {
 *   vote: (pollId, choice) => Promise<any>
 *   loading: boolean
 *   error: string | null
 * }
 */

export function usePollVote(user: User | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vote = useCallback(
    async (pollId: number, choice: "yes" | "no") => {
      if (!user?.id) {
        setError("User not logged in");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${API_BASE_URL}/poll/${pollId}/vote`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              choice,
            }),
          }
        );

        if (!res.ok) {
          throw new Error("Vote failed");
        }

        return await res.json();

      } catch (err) {
        console.error("Vote error:", err);
        setError("Failed to submit vote");
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  return { vote, loading, error };
}