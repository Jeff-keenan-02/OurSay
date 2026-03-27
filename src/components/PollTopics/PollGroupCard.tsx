import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Card, Text, ProgressBar, List, useTheme } from "react-native-paper";

import { PollGroup } from "../../types/PollGroup";
import { PollAccessState } from "../../utils/pollAccess";
import { AccessStatusChip } from "../common/AccessStatusChip";
import { VerificationTier } from "../../types/verification";

type Props = {
  group: PollGroup;
  state: PollAccessState;
  onPress: () => void;
  onViewAnalytics?: () => void;
};

export default function PollGroupCard({
  group,
  state,
  onPress,
  onViewAnalytics,
}: Props) {
  const theme = useTheme();

  const { title, progress, completed_polls, total_polls, respondent_count } = group;

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
    const tier = (group.required_verification_tier ?? 0) as VerificationTier;
    if (isLocked)    return <AccessStatusChip variant="locked" requiredTier={tier} />;
    if (isCompleted) return <AccessStatusChip variant="completed" />;
    if (tier > 0)    return <AccessStatusChip variant="tier" requiredTier={tier} />;
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
        <Card.Content>
          {/* Header row: status icon + title + tier/status badge */}
          <View style={styles.headerRow}>
            <List.Icon icon={icon} color={statusColor} style={styles.headerIcon} />
            <Text
              style={[styles.title, { color: theme.colors.onSurface }]}
              numberOfLines={2}
            >
              {title}
            </Text>
            {renderStatusBadge()}
          </View>

          <ProgressBar
            progress={progress}
            color={statusColor}
            style={styles.progress}
          />

          {/* Footer: questions progress + participants */}
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
              {completed_polls}/{total_polls} questions
            </Text>
            <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
              {(respondent_count ?? 0).toLocaleString()} participant{respondent_count === 1 ? "" : "s"}
            </Text>
          </View>

          {onViewAnalytics && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onViewAnalytics();
              }}
              activeOpacity={0.7}
              style={styles.analyticsChip}
            >
              <List.Icon icon="chart-bar" style={styles.analyticsChipIcon} color={theme.colors.primary} />
              <Text style={[styles.analyticsChipText, { color: theme.colors.primary }]}>
                View Analytics
              </Text>
            </TouchableOpacity>
          )}
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 4,
  },
  headerIcon: {
    margin: 0,
    width: 36,
    height: 36,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
  },
  progress: {
    height: 8,
    borderRadius: 6,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    opacity: 0.7,
  },
  analyticsChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(128,128,128,0.2)",
  },
  analyticsChipIcon: {
    margin: 0,
    width: 20,
    height: 20,
  },
  analyticsChipText: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
});