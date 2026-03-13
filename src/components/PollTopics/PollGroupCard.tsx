import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Card, Text, ProgressBar, List, useTheme } from "react-native-paper";
import { PollGroup } from "../../types/PollGroup";
import { PollAccessState } from "../../utils/pollAccess";

type Props = {
  group: PollGroup;
  state: PollAccessState;
  onPress: () => void;
};

export default function PollGroupCard({
  group,
  state,
  onPress,
}: Props) {
  const theme = useTheme();

  const { title, progress, completed_polls, total_polls } = group;

  /* ----------------------------------------
     State Mapping
  ---------------------------------------- */

  const isLocked = state === "locked";
  const isCompleted = state === "completed";
  const isInProgress = state === "in_progress";

  const isDisabled = isLocked || isCompleted;

  const statusText =
    state === "completed"
      ? "Completed"
      : state === "in_progress"
      ? "In Progress"
      : "Not Started";

  const statusColor =
    state === "completed"
      ? "#4caf50"
      : state === "in_progress"
      ? "#ff9800"
      : "#9e9e9e";

  const icon =
    state === "completed"
      ? "check-circle-outline"
      : state === "in_progress"
      ? "progress-clock"
      : "checkbox-blank-circle-outline";

  /* ----------------------------------------
     Status Badge
  ---------------------------------------- */

  const renderStatusBadge = () => {
    if (isLocked) {
      return (
        <Text style={[styles.statusText, { color: theme.colors.error }]}>
          🔒 Verification required
        </Text>
      );
    }

    if (isCompleted) {
      return (
        <Text style={[styles.statusText, { color: "#4caf50" }]}>
          ✅ Completed — Participation recorded
        </Text>
      );
    }

    return null;
  };

  /* ----------------------------------------
     Render
  ---------------------------------------- */

  return (
    <TouchableOpacity
      disabled={isDisabled}
      onPress={onPress}
      activeOpacity={isDisabled ? 1 : 0.85}
    >
      <Card
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            opacity: isDisabled ? 0.65 : 1,
          },
        ]}
      >
        <Card.Title
          title={title}
          titleStyle={{
            color: theme.colors.onSurface,
            fontSize: 20,
            fontWeight: "600",
          }}
          left={(props) => (
            <List.Icon {...props} icon={icon} color={statusColor} />
          )}
        />

        {renderStatusBadge()}

        <Card.Content>
          <ProgressBar
            progress={progress}
            color={statusColor}
            style={styles.progress}
          />

          <Text
            style={{
              color: theme.colors.onSurfaceVariant,
              marginTop: 6,
            }}
          >
            {statusText} — {completed_polls}/{total_polls} polls
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 18,
  },
  progress: {
    height: 8,
    borderRadius: 6,
  },
  statusText: {
    fontWeight: "600",
    marginHorizontal: 16,
    marginBottom: 6,
  },
});