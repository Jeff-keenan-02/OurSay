import { DiscussionListItem } from "../types/discussion";
import { Petition } from "../types/petition";
import { TrendingCardData } from "../types/trendingCardData";
import { getPollAccessState } from "../utils/pollAccess";
import { PollGroup } from "../types/PollGroup";



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
    created_by: discussion.created_by,
    created_at: discussion.created_at,
  };
}

export function mapPollGroupToTrending(
  group: PollGroup,
  userTier: number
): TrendingCardData {

  const accessState = getPollAccessState(userTier, group);

  return {
    type: "poll",
    id: group.id,
    title: group.title,
    progress: group.progress,
    total_polls: group.total_polls,
    completed_polls: group.completed_polls,
    respondent_count: group.respondent_count,
    status: group.status,
    accessState,
    required_verification_tier: group.required_verification_tier,
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
    has_signed: petition.has_signed,
    required_verification_tier: petition.required_verification_tier,
  };
}