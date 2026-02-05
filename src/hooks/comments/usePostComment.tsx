import { useCallback } from "react";
import { API_BASE_URL } from "../../config/api";

export function usePostComment( discussionId: number, onSuccess?: () => void) {
    const API = API_BASE_URL;
  const postComment = useCallback(
    async (text: string, userId: number) => {
      if (!text.trim()) return;

      try {
        const res = await fetch(`${API}/discussions/${discussionId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: text, userId }),
        });

        if (!res.ok) {
          throw new Error("Failed to post comment");
        }

        if (onSuccess) onSuccess(); // e.g. reload discussion
      } catch (err) {
        console.error("Error posting comment:", err);
      }
    },
    [API, discussionId, onSuccess]
  );

  return { postComment };
}