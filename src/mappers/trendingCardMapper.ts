import { DiscussionListItem } from "../types/discussion";
import { Poll } from "../types/poll";
import { Petition } from "../types/petition";
import { TrendingCardData } from "../types/trendingCardData";



export function mapDiscussionToTrending(
  discussion: DiscussionListItem
): TrendingCardData {
  return {
    type: "discussion",
    id: discussion.id,
    title: discussion.title,
    description: discussion.body,
    upvotes: discussion.upvotes,
    downvotes: discussion.downvotes,
    comment_count: discussion.comment_count,

  };
}


export function mapPollToTrending(
  poll: {
    id: number;
    title: string;
    completed_polls: number;
    total_polls: number;
    progress: number;
    status: 0 | 1 | 2;
  }
): TrendingCardData {
  return {
    type: "poll",
    id: poll.id,
    title: poll.title,
    progress: poll.progress,
    total_polls: poll.total_polls,
    completed_polls: poll.completed_polls,
    status: poll.status,
  };
}


export function mapPetitionToTrending(
  petition: Petition
): TrendingCardData {
  return {
    type: "petition",
    id: petition.id,
    title: petition.title,
    description: petition.description,
    signature_goal: petition.signature_goal,
    signatures: petition.signatures,
    progress: petition.progress,
    required_verification_tier: petition.required_verification_tier,
  };
}