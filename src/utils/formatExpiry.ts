export function formatExpiry(dateString: string | null): string {
  if (!dateString) return "No expiry";

  const expiry = new Date(dateString);
  const now = new Date();

  const diffMs = expiry.getTime() - now.getTime();

  if (diffMs <= 0) return "expired";

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 7) {
    return `in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
  }

  if (diffDays < 30) {
    return `in ${diffDays} days`;
  }

  const months = Math.floor(diffDays / 30);

  if (months < 12) {
    return `in ${months} month${months > 1 ? "s" : ""}`;
  }

  const years = Math.floor(months / 12);
  return `in ${years} year${years > 1 ? "s" : ""}`;
}