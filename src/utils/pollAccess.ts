import { PollGroup } from "../types/PollGroup";
import { VerificationTier } from "../types/verification";
import { FeatureAccessState } from "./accessTypes";
import { permissions } from "./permissions";


export function getPollAccessState(
  userTier: VerificationTier,
  poll: Pick<PollGroup, "required_verification_tier" | "status">
): FeatureAccessState {

  // 🔒 Verification lock
  if (
    !permissions.canVotePoll(
      userTier,
      poll.required_verification_tier
    )
  ) {
    return "locked_verification";
  }

  // ✅ Already completed
  if (poll.status === 2) {
    return "completed";
  }

  // 🚀 Available
  return "available";
}