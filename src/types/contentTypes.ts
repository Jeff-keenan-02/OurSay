export type ContentType = "poll" | "discussion" | "petition";

export type ContentTypeInfo = {
  label: string;
  weeklyLabel: string;
  icon: string;
  color: string;
};

export const CONTENT_TYPES: Record<ContentType, ContentTypeInfo> = {
  poll: {
    label: "Poll",
    weeklyLabel: "Weekly Poll",
    icon: "chart-bar",
    color: "#0ea5e9",
  },
  discussion: {
    label: "Discussion",
    weeklyLabel: "Weekly Discussion",
    icon: "forum-outline",
    color: "#6366f1",
  },
  petition: {
    label: "Petition",
    weeklyLabel: "Weekly Petition",
    icon: "file-sign",
    color: "#f59e0b",
  },
};
