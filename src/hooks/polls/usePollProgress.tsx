import { useState, useEffect } from "react";
import { Alert } from "react-native";

export function usePollProgress(
  API: string,
  topicId: number,
  user: { id: number } | null,
  polls: any[],
  navigation: any
) {
  const [status, setStatus] = useState<0 | 1 | 2>(0);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!polls.length || !user) return;

    const loadProgress = async () => {
      try {
        const res = await fetch(
          `${API}/poll-topic-progress/${topicId}?userId=${user.id}`
        );
        const data = await res.json();

        setStatus(data.status);

        if (data.status === 0) {
          setIndex(0);
        } else if (data.status === 1) {
          setIndex(data.completed_polls);
        } else if (data.status === 2) {
          setIndex(polls.length);

          Alert.alert(
            "Poll completed",
            "You have already completed this poll."
          );

          navigation.goBack();
        }
      } catch (err) {
        console.error("Failed to load poll progress:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [polls, user, topicId]);

  return {
    status,
    index,
    setIndex,   // used as user advances
    loading
  };
}