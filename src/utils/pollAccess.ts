import { Alert } from "react-native";
import { PollTopic } from "../types/PollTopic";
import { permissions } from "./permissions";

export function canOpenPoll(topic: PollTopic, user: any): boolean {
  const userTier = user?.verification_level ?? 0;
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