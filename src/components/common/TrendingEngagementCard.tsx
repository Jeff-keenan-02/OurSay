import React, { useMemo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  Card,
  Text,
  IconButton,
  Divider,
  useTheme,
  ProgressBar,
} from "react-native-paper";
import { TrendingCardData } from "../../types/trendingCardData";
import { CONTENT_TYPES, ContentType } from "../../types/contentTypes";
import { getProgressColor } from "../../utils/progressColor";
import { AccessStatusChip } from "./AccessStatusChip";
import { VerificationTier } from "../../types/verification";

type Props = {
  data: TrendingCardData;
  onPress: () => void;
  onVote?: (id: number, direction: "up" | "down") => void;
  onViewAnalytics?: () => void;
};

export default function TrendingEngagementCard({
  data,
  onPress,
  onVote,
  onViewAnalytics,
}: Props) {
  const theme = useTheme();
  const meta = CONTENT_TYPES[data.type as ContentType] ?? CONTENT_TYPES.poll;

  const isPoll     = data.type === "poll";
  const isPetition = data.type === "petition";

  const isLocked    = isPoll && data.accessState === "locked";
  const isCompleted = isPoll && data.accessState === "completed";
  const hasSigned   = isPetition && !!(data as any).has_signed;
  const isDisabled  = isLocked || isCompleted;

  const requiredTier: VerificationTier | null = (() => {
    const t = (data as any).required_verification_tier;
    return t != null && t > 0 ? (t as VerificationTier) : null;
  })();

  /* --------------------------------------------------
     Header badge — right side of trending row
  ---------------------------------------------------*/
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

  /* --------------------------------------------------
     Description
  ---------------------------------------------------*/
  const descriptionText = useMemo(() => {
    switch (data.type) {
      case "discussion": return null; // replaced by meta row
      case "petition":   return data.description;
      case "poll":       return `${data.respondent_count.toLocaleString()} participant${data.respondent_count === 1 ? "" : "s"}`;
      default:           return "";
    }
  }, [data]);

  /* --------------------------------------------------
     Footer metrics
  ---------------------------------------------------*/
  const renderFooter = () => {
    switch (data.type) {
      case "discussion":
        return (
          <View style={styles.metricsRow}>
            <Metric icon="thumb-up"   value={data.upvotes}      onPress={() => onVote?.(data.id, "up")}   color={theme.colors.primary} />
            <Metric icon="thumb-down" value={data.downvotes}    onPress={() => onVote?.(data.id, "down")} color={theme.colors.primary} />
            <Metric icon="comment"    value={data.comment_count}                                           color={theme.colors.primary} />
          </View>
        );

      case "poll":
        return (
          <>
            <ProgressBar
              progress={data.progress}
              color={getProgressColor(data.progress, isCompleted)}
              style={styles.progressBar}
            />
            <Text style={[styles.subText, { color: theme.colors.onSurfaceVariant }]}>
              {data.completed_polls}/{data.total_polls} completed
            </Text>
          </>
        );

      case "petition":
        return (
          <>
            <ProgressBar
              progress={data.progress}
              color={getProgressColor(data.progress, data.signatures >= data.signature_goal)}
              style={styles.progressBar}
            />
            <View style={styles.petitionMetaRow}>
              <Text style={[styles.subText, { color: theme.colors.onSurfaceVariant }]}>
                {data.signatures} signatures
              </Text>
              <Text style={[styles.subText, { color: theme.colors.onSurfaceVariant }]}>
                Goal: {data.signature_goal}
              </Text>
            </View>
          </>
        );

      default:
        return null;
    }
  };

  /* --------------------------------------------------
     Render
  ---------------------------------------------------*/
  return (
    <TouchableOpacity onPress={onPress} disabled={isDisabled} activeOpacity={isDisabled ? 1 : 0.9}>
      <View style={styles.wrapper}>
        <Card
          mode="elevated"
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderLeftColor: meta.color,
              opacity: isDisabled && !hasSigned ? 0.65 : 1,
            },
          ]}
        >
          {/* Header row: Trending tag left, tier/status badge right */}
          <View style={styles.headerRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>🔥 Trending</Text>
            </View>
            {renderHeaderBadge()}
          </View>

          <Card.Content style={styles.contentContainer}>
            {/* Title */}
            <View style={styles.titleContainer}>
              <Text
                numberOfLines={3}
                ellipsizeMode="tail"
                style={[styles.title, { color: theme.colors.onSurface }]}
              >
                {data.title}
              </Text>
            </View>

            {/* Discussion: created by + date under title */}
            {data.type === "discussion" && (data.created_by || data.created_at) && (
              <View style={styles.discussionMeta}>
                {data.created_by && (
                  <Text style={[styles.metaLabel, { color: theme.colors.primary }]}>
                    Created by <Text style={[styles.metaLabel, { color: theme.colors.primary, fontWeight: "700" }]}>{data.created_by}</Text>
                  </Text>
                )}
                {data.created_at && (
                  <Text style={[styles.metaLabel, { color: theme.colors.primary }]}>
                    {new Date(data.created_at).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                )}
              </View>
            )}

            {/* Description — for poll/petition */}
            {descriptionText != null && (
              <View style={styles.descriptionContainer}>
                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
                >
                  {descriptionText}
                </Text>
              </View>
            )}

            <Divider style={styles.divider} />

            {/* Footer — fixed height area */}
            <View style={styles.metricsContainer}>
              {renderFooter()}

              {/* Analytics shortcut inside metrics so it doesn't grow the card */}
              {onViewAnalytics && (isPoll || isPetition) && (
                <TouchableOpacity
                  onPress={(e) => { e.stopPropagation?.(); onViewAnalytics(); }}
                  activeOpacity={0.7}
                  style={styles.analyticsChip}
                >
                  <IconButton icon="chart-bar" size={13} iconColor={theme.colors.primary} style={styles.analyticsChipIcon} />
                  <Text style={[styles.analyticsChipText, { color: theme.colors.primary }]}>
                    View Analytics
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Card.Content>
        </Card>
      </View>
    </TouchableOpacity>
  );
}

/* --------------------------------------------------
   Metric
---------------------------------------------------*/
function Metric({ icon, value, onPress, color }: { icon: string; value: number; onPress?: () => void; color: string }) {
  return (
    <View style={styles.metricGroup}>
      <IconButton icon={icon} size={20} iconColor={color} onPress={onPress} />
      <Text>{value}</Text>
    </View>
  );
}

/* --------------------------------------------------
   Styles
---------------------------------------------------*/
const styles = StyleSheet.create({
  wrapper: {
    width: 260,
    marginHorizontal: 6,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ffffff22",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
  },
  tag: {
    backgroundColor: "rgba(78,163,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: "#A8CFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  contentContainer: {
    justifyContent: "space-between",
  },
  titleContainer: {
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 23,
  },
  descriptionContainer: {
    minHeight: 44,
  },
  description: {
    fontSize: 14,
  },
  divider: {
    marginVertical: 6,
  },
  metricsContainer: {
    justifyContent: "center",
    gap: 4,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  metricGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    height: 8,
    borderRadius: 6,
  },
  petitionMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  subText: {
    fontSize: 12,
    marginTop: 6,
  },
  analyticsChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingRight: 10,
    paddingVertical: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(128,128,128,0.2)",
  },
  analyticsChipIcon: {
    margin: 0,
    width: 26,
    height: 26,
  },
  analyticsChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  discussionFooter: {
    gap: 6,
  },
  discussionMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  metaLabel: {
    fontSize: 11,
    opacity: 0.75,
  },
});
