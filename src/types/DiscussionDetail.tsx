export type DiscussionDetail = {
  id: number;
  title: string;
  body: string;
  created_at: string;
  username?: string | null;
  comments: {
    id: number;
    body: string;
    created_at: string;
    username: string | null;
  }[];
};