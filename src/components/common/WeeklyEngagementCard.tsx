import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native";
import { Card, ProgressBar, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { WeeklyCardData } from "../../types/WeeklyCardData";
import { PollAccessState } from "../../utils/pollAccess";
import { spacing } from "../../theme/spacing";
import { CONTENT_TYPES, ContentType } from "../../types/contentTypes";
import { getProgressColor } from "../../utils/progressColor";

type Props = {
  data: WeeklyCardData;
  onPress: () => void;
  state?: PollAccessState;
};

export function WeeklyEngagementCard({ data, onPress, state = "available" }: Props) {
  const theme = useTheme();
  const meta = CONTENT_TYPES[data.type as ContentType] ?? CONTENT_TYPES.poll;

  const isPoll      = data.type === "poll";
  const isLocked    = isPoll && state === "locked";
  const isCompleted = isPoll && state === "completed";
  const isDisabled  = isLocked || isCompleted;

  const renderFooter = () => {
    switch (data.type) {
      case "discussion":
        return (
          <View style={styles.footerRow}>
            <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
              {(data as any).footerText}
            </Text>
            <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
              by {(data as any).createdBy}
            </Text>
          </View>
        );
      case "poll":
        return (
          <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
            {(data as any).footerText}
          </Text>
        );
      case "petition":
        return (
          <View style={styles.footerRow}>
            <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
              {(data as any).signatures} signatures
            </Text>
            <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
              Goal: {(data as any).signature_goal}
            </Text>
          </View>
        );
    }
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={isDisabled} activeOpacity={isDisabled ? 1 : 0.9}>
      <Card
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderLeftColor: meta.color,
            opacity: isDisabled ? 0.65 : 1,
          },
        ]}
      >
        <Card.Content>
          {/* Type pill */}
          <View style={[styles.pill, { backgroundColor: meta.color + "18" }]}>
            <MaterialCommunityIcons name={meta.icon} size={13} color={meta.color} />
            <Text style={[styles.pillText, { color: meta.color }]}>{meta.weeklyLabel}</Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {data.title}
          </Text>

          {/* Status badges (poll only) */}
          {isLocked && (
            <Text style={[styles.statusText, { color: theme.colors.error }]}>
              🔒 Verification required
            </Text>
          )}
          {isCompleted && (
            <Text style={[styles.statusText, { color: "#4caf50" }]}>
              ✅ Completed — Participation recorded
            </Text>
          )}

          {/* Description */}
          {"description" in data && (
            <Text
              numberOfLines={2}
              style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
            >
              {(data as any).description}
            </Text>
          )}

          {/* Progress bar */}
          {"progress" in data && (
            <ProgressBar
              progress={(data as any).progress}
              color={getProgressColor(
                (data as any).progress,
                data.type === "poll" ? isCompleted : (data as any).signatures >= (data as any).signature_goal
              )}
              style={styles.progressBar}
            />
          )}

          {/* Per-type footer */}
          {renderFooter()}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderLeftWidth: 4,
    paddingVertical: spacing.sm,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
    marginBottom: spacing.sm,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 6,
    borderRadius: 6,
    marginBottom: spacing.sm,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  metaText: {
    fontSize: 12,
    opacity: 0.7,
  },
});
