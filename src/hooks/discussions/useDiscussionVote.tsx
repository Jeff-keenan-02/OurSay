import { API_BASE_URL } from "../../config/api";
import { DiscussionListItem } from "../../types/Discussion";
import { User } from "../../types/User";

/**
 * useDiscussionVote
 *
 * Handles voting on a discussion.
 *
 * - Sends vote to backend
 * - Updates local discussion list with new vote counts
 *
 * Used in:
 * - Trending list
 * - Topic discussion list
 *
 * @param user - currently logged in user
 * @param setDiscussions - state setter from list hook
 */

export function useDiscussionVote(
  user: User | null,
  setDiscussions: React.Dispatch<React.SetStateAction<DiscussionListItem[]>>
) {
  const vote = async (id: number, direction: "up" | "down") => {
    if (!user) throw new Error("Not logged in");

    const res = await fetch(`${API_BASE_URL}/discussions/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, direction }),
    });

    if (!res.ok) {
      throw new Error("Vote failed");
    }

    const updated = await res.json();

    // Update the specific discussion in list
    setDiscussions((prev) =>
      prev.map((d) =>
        d.id === updated.id
          ? { ...d, ...updated }
          : d
      )
    );

    return updated;
  };

  return { vote };
}