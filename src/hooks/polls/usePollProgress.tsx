import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";

/**
 * usePollProgress
 *
 * Fetches and tracks user progress inside a poll group.
 *
 * Used in:
 * - SwipePollScreen
 *
 * Tracks:
 * - status (0 = not started, 1 = in progress, 2 = completed)
 * - index (number of polls completed)
 */
export function usePollProgress(
  groupId: number | null,
  user: { id: number } | null,
  polls: any[]
) {
  const [status, setStatus] = useState<0 | 1 | 2>(0);
  const [index, setIndex] = useState(0);

  const reload = async () => {
    if (!user || !groupId) return;

    const res = await fetch(
      `${API_BASE_URL}/poll/groups/${groupId}/progress?userId=${user.id}`
    );

    if (!res.ok) return;

    const data = await res.json();

    setStatus(data.status);
    setIndex(data.completed_polls);
  };

  useEffect(() => {
    if (polls.length) reload();
  }, [polls]);

  return { status, index, reload };
}