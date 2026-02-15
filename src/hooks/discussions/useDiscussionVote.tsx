// hooks/discussions/useDiscussionVote.ts

import { DiscussionListItem } from "../../types/Discussion";
import { User } from "../../types/User";
import { apiClient } from "../../services/apiClient";

/* =====================================================
   useDiscussionVote
   Handles voting mutation for discussions
===================================================== */

export function useDiscussionVote(
  user: User | null,
  updateData: (
    updater: (prev: DiscussionListItem[]) => DiscussionListItem[]
  ) => void
) {

  /* -------------------------------------------------
     Vote Mutation
  --------------------------------------------------*/

  const vote = async (
    id: number,
    direction: "up" | "down"
  ): Promise<DiscussionListItem> => {

    if (!user) {
      throw new Error("Not logged in");
    }

    try {
      const updated = await apiClient.post<DiscussionListItem>(
        `/discussions/${id}/vote`,
        {
          userId: user.id,
          direction,
        }
      );

      /* ---------------------------------------------
         Optimistically update local cache
      ----------------------------------------------*/

      updateData((prev) =>
        prev.map((d) =>
          d.id === updated.id
            ? { ...d, ...updated }
            : d
        )
      );

      return updated;

    } catch (err: any) {
      console.error("Vote failed:", err);
      throw new Error(err.message || "Vote failed");
    }
  };

  /* -------------------------------------------------
     Return Mutation
  --------------------------------------------------*/

  return { vote };
}