import { useState, useCallback } from "react";
import { API_BASE_URL } from "../../config/api";

/**
 * usePostComment
 *
 * Submits a comment to a discussion.
 *
 * Returns:
 * {
 *   postComment: (text, userId) => Promise<any>
 *   loading: boolean
 *   error: string | null
 * }
 */

export function usePostComment(discussionId: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postComment = useCallback(
    async (text: string, userId: number) => {
      if (!discussionId || !text.trim()) return;

      try {
        setLoading(true);
        setError(null);

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

        return await res.json();

      } catch (err) {
        console.error("Error posting comment:", err);
        setError("Failed to post comment");
      } finally {
        setLoading(false);
      }
    },
    [discussionId]
  );

  return { postComment, loading, error };
}