import { Alert } from "react-native";
import { PollGroup } from "../types/PollGroup";
import { permissions } from "./permissions";

export function canOpenPoll(topic: PollGroup, user: any): boolean {
  const userTier = user?.verification_tier ?? 0;
  const requiredTier = 2;

  if (!permissions.canVotePoll(userTier, requiredTier)) {
    Alert.alert(
      "Verification required",
      "Verify your identity to participate in polls."
    );
    return false;
  }

  if (topic.status === 2) {
    Alert.alert(
      "Poll completed",
      "You have already completed this poll."
    );
    return false;
  }

  return true;
}