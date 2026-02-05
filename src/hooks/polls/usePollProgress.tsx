import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { API_BASE_URL } from "../../config/api";

export function usePollProgress(
  topicId: number,
  user: { id: number } | null,
  polls: any[],
  navigation: any
) {
  const [status, setStatus] = useState<0 | 1 | 2>(0);
  const [index, setIndex] = useState(0);
  const API = API_BASE_URL;
  const reload = async () => {
    if (!user) return;

    const res = await fetch(
      `${API}/poll/poll-topic-progress/${topicId}?userId=${user.id}`
    );

    const data = await res.json();

    setStatus(data.status);
    setIndex(data.completed_polls);
  };

  useEffect(() => {
    if (polls.length) reload();
  }, [polls]);

  return { status, index, reload };
}