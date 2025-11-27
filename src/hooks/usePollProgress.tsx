import { useState, useEffect } from "react";
import { Alert } from "react-native";

export function usePollProgress(API: string, topicId: number, user: any, polls: any[], navigation: any) {
  const [status, setStatus] = useState(0);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!polls.length || !user) return;

    fetch(`${API}/poll-topic-progress/${topicId}?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setStatus(data.status);

        if (data.status === 0) {
          setIndex(0);

        } else if (data.status === 1) {
          setIndex(data.completed_polls);

        } else if (data.status === 2) {
          Alert.alert(
            "Poll Completed",
            "Do you want to retake it?",
            [
              { text: "No", onPress: () => navigation.goBack() },
              {
                text: "Retake",
                onPress: async () => {
                  await fetch(`${API}/poll-topic-progress/${topicId}/reset`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: user.id }),
                  });

                  setIndex(0);
                  setStatus(0);
                }
              }
            ]
          );
        }
      });
  }, [polls]);

  return { status, index, setIndex, setStatus };
}