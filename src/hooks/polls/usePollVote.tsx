import { API_BASE_URL } from "../../config/api";
import { User } from "../../types/User";

/**
 * Hook: usePollVote
 * 
 * Responsible for submitting a vote on a single poll.
 * Does not manage progress or navigation.
 */
export function usePollVote(user: User | null) {

  const vote = async (pollId: number, choice: "yes" | "no") => {
    if (!user) return;

    try {
      const res = await fetch(`${API_BASE_URL}/poll/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          choice,
          userId: user.id,
        }),
      });

      if (!res.ok) {
        throw new Error("Vote failed");
      }

      return await res.json();

    } catch (err) {
      console.error("Vote error:", err);
    }
  };

  return { vote };
}