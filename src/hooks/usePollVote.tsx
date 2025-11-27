export function usePollVote(API: string, topicId: number, user: any, setIndex: any, setStatus: any) {
  const vote = async (pollId: number, choice: "yes" | "no") => {
    if (!user) return;

    // Submit vote
    await fetch(`${API}/polls/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, choice }),
    });

    // Update progress
    await fetch(`${API}/poll-topic-progress/${topicId}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });

    // Get latest status
    const latest = await fetch(
      `${API}/poll-topic-progress/${topicId}?userId=${user.id}`
    ).then((r) => r.json());

    setStatus(latest.status);
    setIndex(latest.completed_polls);
  };

  return { vote };
}