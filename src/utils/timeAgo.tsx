export function timeAgo(ts: string | Date) {
  const date = typeof ts === "string" ? new Date(ts) : ts;
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const hr = Math.floor(diffMin / 60);
  if (hr < 24) return `${hr}h ago`;

  return `${Math.floor(hr / 24)}d ago`;
}