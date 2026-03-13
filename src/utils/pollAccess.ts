import { PollGroup } from "../types/PollGroup";

export type PollAccessState =
  | "locked"
  | "available"
  | "in_progress"
  | "completed";

export function getPollAccessState(
  userTier: number,
  poll: Pick<PollGroup, "required_verification_tier" | "status">
): PollAccessState {

  // Locked by tier
  if (userTier < poll.required_verification_tier) {
    return "locked";
  }

  // Completed
  if (poll.status === 2) {
    return "completed";
  }

  // In Progress
  if (poll.status === 1) {
    return "in_progress";
  }

  // Available
  return "available";
}