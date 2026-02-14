export type PollGroup = {
  id: number;
  title: string;

  total_polls: number;
  completed_polls: number;

  progress: number;
  status: 0 | 1 | 2;
};