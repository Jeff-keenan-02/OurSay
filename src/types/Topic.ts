export type Topic = {
  id: number;
  title: string;
  description: string | null;
  source: "official" | "weekly" | "community";
};