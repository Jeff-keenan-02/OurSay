// hooks/useDiscussionVote.ts
export function useDiscussionVote(API: string, user: any, setDiscussions: any) {
  const vote = async (id: number, direction: "up" | "down") => {
    if (!user) throw new Error("Not logged in");

    const res = await fetch(`${API}/discussions/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, direction }),
    });

    const updated = await res.json();

    setDiscussions((prev: any[]) =>
      prev.map((d) => (d.id === updated.id ? { ...d, ...updated } : d))
    );

    return updated;
  };

  return { vote };
}