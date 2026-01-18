export type DiscussionDetail = {
  id: number;
  title: string;
  body: string;
  created_at: string;
  comments: {
    id: number;
    body: string;
    created_at: string;
    username: string | null;
  }[];
};