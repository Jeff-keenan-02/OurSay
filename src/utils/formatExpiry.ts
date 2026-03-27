export function formatExpiry(dateString: string | null): string {
  if (!dateString) return "No expiry";

  const expiry = new Date(dateString);
  if (isNaN(expiry.getTime())) return "No expiry";

  if (expiry.getTime() <= Date.now()) return "Expired";

  return expiry.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}