import { API_BASE_URL } from "../../config/api";
import { User } from "../../types/User";

export function usePollVote(
  topicId: number,
  user: User | null,
) {
  const API = API_BASE_URL;
  const vote = async (pollId: number, choice: "yes" | "no") => {
    if (!user) return;

    try {
      const res = await fetch(`${API}/poll/${pollId}/vote`, {
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

    } catch (err) {
      console.error("Vote error:", err);
    }
  };
  
  return { vote };
}