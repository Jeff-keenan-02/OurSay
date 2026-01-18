import { User } from "../../types/User";

export function usePollVote(
  API: string,
  topicId: number,
  user: User | null,
  setIndex: (n: number) => void,
  setStatus: (s: 0 | 1 | 2) => void
) {
  const vote = async (pollId: number, choice: "yes" | "no") => {
    if (!user) return;

    try {
      const res = await fetch(`${API}/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          choice,
          userId: user.id, // 🔒 participation only (NO vote linkage)
        }),
      });

      if (!res.ok) {
        throw new Error("Vote failed");
      }

      /**
       * Backend is authoritative for progress
       * It already knows how many polls this user has completed
       */
      const progressRes = await fetch(
        `${API}/poll-topic-progress/${topicId}?userId=${user.id}`
      );

      const progress = await progressRes.json();

      setStatus(progress.status);
      setIndex(progress.completed_polls);

    } catch (err) {
      console.error("Vote error:", err);
    }
  };

  return { vote };
}