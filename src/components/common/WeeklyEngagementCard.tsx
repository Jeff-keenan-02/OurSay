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
import { AccessStatusChip } from "./AccessStatusChip";
import { VerificationTier } from "../../types/verification";

type Props = {
  data: WeeklyCardData;
  onPress: () => void;
  state?: PollAccessState;
  onViewAnalytics?: () => void;
};

export function WeeklyEngagementCard({ data, onPress, state = "available", onViewAnalytics }: Props) {
  const theme = useTheme();
  const meta = CONTENT_TYPES[data.type as ContentType] ?? CONTENT_TYPES.poll;

  const isPoll      = data.type === "poll";
  const isPetition  = data.type === "petition";
  const isLocked    = isPoll && state === "locked";
  const isCompleted = isPoll && state === "completed";
  const hasSigned   = isPetition && !!(data as any).has_signed;
  const isDisabled  = isLocked || isCompleted;

  const requiredTier: VerificationTier | null = (() => {
    const t = (data as any).required_verification_tier;
    return t != null && t > 0 ? (t as VerificationTier) : null;
  })();

  const renderHeaderBadge = () => {
    if (isLocked && requiredTier != null)
      return <AccessStatusChip variant="locked" requiredTier={requiredTier} />;
    if (isCompleted)
      return <AccessStatusChip variant="completed" />;
    if (hasSigned)
      return <AccessStatusChip variant="signed" />;
    if (requiredTier != null && (isPoll || isPetition))
      return <AccessStatusChip variant="tier" requiredTier={requiredTier} />;
    return null;
  };

  const renderFooter = () => {
    switch (data.type) {
      case "discussion":
        return (
          <View style={styles.footerRow}>
            <View style={styles.footerIconRow}>
              <MaterialCommunityIcons name="comment-outline" size={13} color={theme.colors.primary} />
              <Text style={[styles.metaText, { color: theme.colors.primary }]}>
                {(data as any).footerText}
              </Text>
            </View>
            <Text style={[styles.metaText, { color: theme.colors.primary }]}>
              Created by <Text style={[styles.metaText, { color: theme.colors.primary, fontWeight: "700" }]}>{(data as any).createdBy}</Text>
            </Text>
          </View>
        );
      case "poll":
        return (
          <View style={styles.footerRow}>
            <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
              {(data as any).footerText}
            </Text>
            <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
              {((data as any).respondent_count ?? 0).toLocaleString()} participant{(data as any).respondent_count === 1 ? "" : "s"}
            </Text>
          </View>
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
            opacity: isDisabled && !hasSigned ? 0.65 : 1,
          },
        ]}
      >
        <Card.Content>
          {/* Header row: type pill left, status/tier badge right */}
          <View style={styles.headerRow}>
            <View style={[styles.pill, { backgroundColor: meta.color + "18" }]}>
              <MaterialCommunityIcons name={meta.icon} size={13} color={meta.color} />
              <Text style={[styles.pillText, { color: meta.color }]}>{meta.weeklyLabel}</Text>
            </View>
            {renderHeaderBadge()}
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {data.title}
          </Text>

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

          {/* Analytics shortcut */}
          {onViewAnalytics && (isPoll || isPetition) && (
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation?.(); onViewAnalytics(); }}
              activeOpacity={0.7}
              style={styles.analyticsChip}
            >
              <MaterialCommunityIcons name="chart-bar" size={14} color={theme.colors.primary} />
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
    borderRadius: 18,
    borderLeftWidth: 4,
    paddingVertical: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
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
    alignItems: "center",
  },
  footerIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    opacity: 0.7,
  },
  analyticsChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    marginTop: spacing.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(128,128,128,0.2)",
  },
  analyticsChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
