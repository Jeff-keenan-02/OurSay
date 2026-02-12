export type TrendingCardData = {
  id: number;
  title: string;
  description?: string;
  upvotes?: number;
  downvotes?: number;
  comment_count?: number;
  signatures?: number;
  type: "discussion" | "poll" | "petition";
};