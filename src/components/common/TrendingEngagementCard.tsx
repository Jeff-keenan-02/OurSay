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

type Props = {
  data: TrendingCardData;
  onPress: () => void;
  onVote?: (id: number, direction: "up" | "down") => void;
};

export default function TrendingEngagementCard({
  data,
  onPress,
  onVote,
}: Props) {
  const theme = useTheme();
  const meta = CONTENT_TYPES[data.type as ContentType] ?? CONTENT_TYPES.poll;

  const isPoll = data.type === "poll";

  const isLocked =
    isPoll && data.accessState === "locked";

  const isCompleted =
    isPoll && data.accessState === "completed";

  const isDisabled = isLocked || isCompleted;

  /* --------------------------------------------------
     Description
  ---------------------------------------------------*/

  const descriptionText = useMemo(() => {
    switch (data.type) {
      case "discussion":
        return data.description;

      case "petition":
        return data.description;

      case "poll":
        return `${data.completed_polls}/${data.total_polls} people completed this poll`;

      default:
        return "";
    }
  }, [data]);

  /* --------------------------------------------------
     Status Badge (Poll Only)
  ---------------------------------------------------*/

  const renderStatusBadge = () => {
    if (!isPoll) return null;

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

  /* --------------------------------------------------
     Footer
  ---------------------------------------------------*/

  const renderFooter = () => {
    switch (data.type) {
      case "discussion":
        return (
          <View style={styles.metricsRow}>
            <Metric
              icon="thumb-up"
              value={data.upvotes}
              onPress={() => onVote?.(data.id, "up")}
              color={theme.colors.primary}
            />
            <Metric
              icon="thumb-down"
              value={data.downvotes}
              onPress={() => onVote?.(data.id, "down")}
              color={theme.colors.primary}
            />
            <Metric
              icon="comment"
              value={data.comment_count}
              color={theme.colors.primary}
            />
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
              <Text
                style={[
                  styles.subText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {data.signatures} signatures
              </Text>
              <Text
                style={[
                  styles.subText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
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
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.9}
    >
      <View style={styles.wrapper}>
        <Card
          mode="elevated"
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderLeftColor: meta.color,
              opacity: isDisabled ? 0.65 : 1,
            },
          ]}
        >
          <View style={styles.tag}>
            <Text style={styles.tagText}>🔥 Trending</Text>
          </View>

          <Card.Content style={styles.contentContainer}>
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={[styles.title, { color: theme.colors.onSurface }]}
            >
              {data.title}
            </Text>

            {renderStatusBadge()}

            <View style={styles.descriptionContainer}>
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                style={[
                  styles.description,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {descriptionText}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.metricsContainer}>
              {renderFooter()}
            </View>
          </Card.Content>
        </Card>
      </View>
    </TouchableOpacity>
  );
}

/* --------------------------------------------------
   Small Metric Component
---------------------------------------------------*/

function Metric({
  icon,
  value,
  onPress,
  color,
}: {
  icon: string;
  value: number;
  onPress?: () => void;
  color: string;
}) {
  return (
    <View style={styles.metricGroup}>
      <IconButton
        icon={icon}
        size={20}
        iconColor={color}
        onPress={onPress}
      />
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
  statusText: {
  fontWeight: "600",
  marginBottom: 6,
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

  tag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(78,163,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },

  tagText: {
    color: "#A8CFFF",
    fontSize: 12,
    fontWeight: "600",
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
  contentContainer: {
  minHeight: 200, // 🔥 locks full card height
  justifyContent: "space-between",
},

descriptionContainer: {
  minHeight: 44, // exact 2-line area
},

metricsContainer: {
  minHeight: 48, // 🔥 forces bottom area equal
  justifyContent: "center",
},

divider: {
  marginVertical: 10,
},

description: {
  fontSize: 14,
},

title: {
  fontSize: 18,
  fontWeight: "600",
},
});