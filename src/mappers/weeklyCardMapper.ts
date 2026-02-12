import { PollGroup } from "../types/PollGroup";
import { WeeklyCardData } from "../types/WeeklyCardData";
import { DiscussionListItem, WeeklyDiscussion } from "../types/Discussion";
import { Petition } from "../types/Petition";


export function mapWeeklyPollToCard(poll: PollGroup): WeeklyCardData {
  return {
    label: "Weekly Public Opinion Poll",
    title: poll.title,
    description: poll.description ?? undefined,
    progress:
      poll.total_polls === 0
        ? 0
        : poll.completed_polls / poll.total_polls,
    footerText: `${poll.completed_polls}/${poll.total_polls} questions answered`,
  };
}


export function mapWeeklyDiscussionToCard(
  discussion: WeeklyDiscussion
): WeeklyCardData {
  return {
    label: "Weekly Community Discussion",
    title: discussion.title,
    description: discussion.body,
    footerText: `${discussion.comment_count} comments`,
    createdBy: discussion.created_by,
  };
}


export function mapWeeklyPetitionToCard(
  petition: Petition
): WeeklyCardData {
  return {
    label: "Weekly Community Petition",
    title: petition.title,
    description: petition.description,
    footerText: `${petition.signatures} signatures`,
  };
}