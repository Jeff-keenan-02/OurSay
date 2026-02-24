// hooks/discussions/usePostComment.ts

import { useState, useCallback } from "react";
import { useApiClient } from "../common/useApiClient";

/* =====================================================
   usePostComment
   Submits a comment to a discussion
===================================================== */

export function usePostComment(discussionId: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useApiClient();
  /* -------------------------------------------------
     Mutation
  --------------------------------------------------*/

  const postComment = useCallback(
    async (text: string, userId: number) => {
      if (!discussionId || !text.trim()) return;

      try {
        setLoading(true);
        setError(null);

        const created = await api.post(
          `/discussions/${discussionId}/comments`,
          {
            body: text.trim(),
            userId,
          }
        );

        return created;

      } catch (err: any) {
        console.error("Error posting comment:", err);
        setError(err.message || "Failed to post comment");
        return null;

      } finally {
        setLoading(false);
      }
    },
    [discussionId]
  );

  /* -------------------------------------------------
     Return
  --------------------------------------------------*/

  return { postComment, loading, error };
}