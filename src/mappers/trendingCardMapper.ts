import { DiscussionListItem } from "../types/discussion";
import { Poll } from "../types/poll";
import { Petition } from "../types/petition";
import { TrendingCardData } from "../types/trendingCardData";



export function mapDiscussionToTrending(
  discussion: DiscussionListItem
): TrendingCardData {
  return {
    id: discussion.id,
    title: discussion.title,
    description: discussion.body,
    upvotes: discussion.upvotes,
    downvotes: discussion.downvotes,
    comment_count: discussion.comment_count,
    type: "discussion",
  };
}


export function mapPollToTrending(poll: Poll): TrendingCardData {
  return {
    id: poll.id,
    title: poll.question,
    description: poll.description ?? undefined,
    type: "poll",
  };
}


export function mapPetitionToTrending(
  petition: Petition
): TrendingCardData {
  return {
    id: petition.id,
    title: petition.title,
    description: petition.description,
    signatures: petition.signatures,
    type: "petition",
  };
}