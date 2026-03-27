import { PollGroup } from "../types/PollGroup";
import { WeeklyCardData } from "../types/WeeklyCardData";
import { WeeklyDiscussion } from "../types/Discussion";
import { Petition } from "../types/Petition";


export function mapPollToWeekly(poll: PollGroup): WeeklyCardData {
  return {
    type: "poll",
    label: "Weekly Public Opinion Poll",
    id: poll.id,
    title: poll.title,
    progress: poll.progress,
    footerText: `${poll.completed_polls}/${poll.total_polls} questions answered`,
    respondent_count: poll.respondent_count,
    required_verification_tier: poll.required_verification_tier,
  };
}


export function mapDiscussionToWeekly(
  discussion: WeeklyDiscussion
): WeeklyCardData {
  return {
    type: "discussion", 
    label: "Weekly Community Discussion",
    id: discussion.id,
    title: discussion.title,
    description: discussion.body,
    footerText: `${discussion.comment_count} comments`,
    createdBy: discussion.created_by,
  };
}


export function mapPetitionToWeekly(
  petition: Petition
): WeeklyCardData {
  return {
    type: "petition", 
    label: "Weekly Community Petition",
    id: petition.id, 
    title: petition.title,
    description: petition.description,
    progress: petition.progress,
    signatures: petition.signatures,
    signature_goal: petition.signature_goal,
    has_signed: petition.has_signed,
    required_verification_tier: petition.required_verification_tier,
  };
}