  import { useState, useEffect, useCallback } from "react";
  import { useFocusEffect } from "@react-navigation/native";
  import { DiscussionDetail } from "../../types/Discussion";
  import { API_BASE_URL } from "../../config/api";

/**
 * useDiscussion
 *
 * Fetches a single discussion with its full detail view:
 * - title
 * - body
 * - created_at
 * - comments[]
 *
 * This hook is used ONLY on the DiscussionDetail screen.
 *
 * Behaviour:
 * - Loads discussion on initial mount
 * - Reloads automatically whenever the screen regains focus
 *   (important after posting a comment or voting)
 *
 * @param id - Discussion ID from route params
 */

  export function useDiscussion(id: number) {
    const [discussion, setDiscussion] = useState<DiscussionDetail | null>(null);
    const [loading, setLoading] = useState(true);

      
    const loadDiscussion = useCallback(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/discussions/${id}`);
        const data = await res.json();
        setDiscussion(data);
      } catch (err) {
        console.error("Failed to load discussion:", err);
      } finally {
        setLoading(false);
      }
    }, [API_BASE_URL, id]);

    useEffect(() => {
      loadDiscussion();
    }, []);

    useFocusEffect(
      useCallback(() => {
        loadDiscussion();
      }, [])
    );

    return { discussion, loading, loadDiscussion };
  }