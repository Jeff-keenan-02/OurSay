// hooks/discussions/useDiscussionVote.ts

import { DiscussionListItem } from "../../types/Discussion";
import { User } from "../../types/User";
import { useApiClient } from "../common/useApiClient";

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

  const api = useApiClient();

  // Tier 1 (liveness) is required to vote on discussions.
  // Enforced in UI (button disabled) and backend (requireTier(1) middleware).
  const canVote = (user?.verification_tier ?? 0) >= 1;

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

    if (!canVote) {
      throw new Error("Tier 1 verification required to vote on discussions");
    }

    try {
      const updated = await api.post<DiscussionListItem>(
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

  return { vote, canVote };
}