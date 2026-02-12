import { useCallback } from "react";
import { API_BASE_URL } from "../../config/api";

/**
 * usePostComment
 *
 * Mutation hook for posting a comment on a discussion.
 *
 * - Sends comment to backend
 * - Optionally triggers reload via onSuccess callback
 *
 * Used in:
 * - DiscussionDetail screen
 */

export function usePostComment(
  discussionId: number,
  onSuccess?: () => void
) {
  const postComment = useCallback(
    async (text: string, userId: number) => {
      if (!discussionId) return;
      if (!text.trim()) return;

      try {
        const res = await fetch(
          `${API_BASE_URL}/discussions/${discussionId}/comments`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              body: text.trim(),
              userId,
            }),
          }
        );

        if (!res.ok) {
          throw new Error("Failed to post comment");
        }

        const createdComment = await res.json();

        // Optional reload hook
        onSuccess?.();

        return createdComment;

      } catch (err) {
        console.error("Error posting comment:", err);
        throw err;
      }
    },
    [discussionId, onSuccess]
  );

  return { postComment };
}