export type PollTopicProgress = {
  topic_id: number;
  completed_polls: number;
  status: 0 | 1 | 2; // 0 = not started, 1 = in progress, 2 = completed
};