import { PollAccessState } from "../utils/pollAccess";

export type TrendingCardData =
  | {
      type: "discussion";
      id: number;
      title: string;
      description: string;
      upvotes: number;
      downvotes: number;
      comment_count: number;
    }
  | {
      type: "poll";
      id: number;
      title: string;
      progress: number;
      total_polls: number;
      completed_polls: number;
      status: 0 | 1 | 2;
      accessState: PollAccessState;
      required_verification_tier?: number;
    }
  | {
      type: "petition";
      id: number;
      title: string;
      description: string;
      signature_goal: number;
      signatures: number;
      progress: number;
      required_verification_tier?: number;
    };