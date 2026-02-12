export type PollGroup = {
  id: number;
  title: string;
  description: string | null;

  total_polls: number;
  completed_polls: number;

  status: 0 | 1 | 2;
  is_weekly: boolean;
};