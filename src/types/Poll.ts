export type Poll = {
  id: number;
  question: string;
  description?: string | null;
  has_voted: boolean;
};