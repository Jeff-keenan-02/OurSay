import { API_BASE_URL } from "../../config/api";
import { DiscussionListItem } from "../../types/Discussion";
import { User } from "../../types/User";

/**
 * useDiscussionVote
 *
 * Mutation hook for voting on a discussion.
 *
 * - Sends vote to backend
 * - Updates cached discussion list using provided updater
 *
 * @param user - currently logged in user
 * @param updateData - updater function from list query hook
 */

export function useDiscussionVote(
  user: User | null,
  updateData: (
    updater: (prev: DiscussionListItem[]) => DiscussionListItem[]
  ) => void
) {
  const vote = async (id: number, direction: "up" | "down") => {
    if (!user) {
      throw new Error("Not logged in");
    }

    const res = await fetch(
      `${API_BASE_URL}/discussions/${id}/vote`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          direction,
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Vote failed");
    }

    const updated: DiscussionListItem = await res.json();

    // Update only the changed discussion in local cache
    updateData((prev) =>
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