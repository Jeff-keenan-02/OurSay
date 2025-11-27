// utils/greeting.ts

export function getGreeting(username?: string): string {
  const hour = new Date().getHours();

  const partOfDay =
    hour < 12
      ? "morning"
      : hour < 18
      ? "afternoon"
      : "evening";

  return `Good ${partOfDay}, ${username || "citizen"}`;
}