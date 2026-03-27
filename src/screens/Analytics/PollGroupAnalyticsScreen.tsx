import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme, ActivityIndicator, Divider } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";
import { useApiClient } from "../../hooks/common/useApiClient";

type PollResult = {
  label: string;
  count: number;
  percentage: number;
};

type PollData = {
  pollId: number;
  question: string;
  totalVotes: number;
  results: PollResult[];
};

type GroupData = {
  groupId: number;
  groupTitle: string;
  polls: PollData[];
};

const OPTION_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#f97316",
  "#10b981",
  "#ef4444",
  "#facc15",
];

function getOptionColor(index: number, label: string): string {
  const lower = label.toLowerCase();
  if (lower === "yes")   return "#22c55e";
  if (lower === "no")    return "#ef4444";
  if (lower === "maybe") return "#facc15";
  return OPTION_COLORS[index % OPTION_COLORS.length];
}

function QuestionCard({ poll, index, total }: { poll: PollData; index: number; total: number }) {
  const theme = useTheme();

  const topResult = poll.results.reduce(
    (best, r) => (r.count > best.count ? r : best),
    poll.results[0] ?? { label: "", count: 0, percentage: 0 }
  );

  return (
    <View style={[styles.questionCard, { backgroundColor: theme.colors.surface }]}>
      {/* Question number + text */}
      <View style={styles.questionHeader}>
        <View style={[styles.qNumber, { backgroundColor: theme.colors.primary + "18" }]}>
          <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: "700" }}>
            Q{index + 1}
          </Text>
        </View>
        <Text
          variant="titleSmall"
          style={[styles.questionText, { color: theme.colors.onSurface }]}
          numberOfLines={3}
        >
          {poll.question}
        </Text>
      </View>

      {/* Mini summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="vote" size={16} color={theme.colors.primary} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {poll.totalVotes.toLocaleString()} votes
          </Text>
        </View>
        {poll.totalVotes > 0 && (
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons
              name="trophy-outline"
              size={16}
              color={getOptionColor(
                poll.results.findIndex((r) => r.label === topResult.label),
                topResult.label
              )}
            />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Leading: {topResult.label} ({topResult.percentage}%)
            </Text>
          </View>
        )}
      </View>

      {/* Result bars */}
      {poll.totalVotes === 0 ? (
        <Text
          variant="bodySmall"
          style={{ opacity: 0.4, marginTop: spacing.xs, fontStyle: "italic" }}
        >
          No votes yet — check back later
        </Text>
      ) : (
        <View style={styles.barsContainer}>
          {poll.results.map((r, i) => {
            const color = getOptionColor(i, r.label);
            return (
              <View key={i} style={styles.barRow}>
                <View style={styles.barLabelRow}>
                  <View style={[styles.colorDot, { backgroundColor: color }]} />
                  <Text variant="labelMedium" style={{ flex: 1, fontWeight: "600" }}>
                    {r.label}
                  </Text>
                  <Text variant="labelSmall" style={{ opacity: 0.6 }}>
                    {r.count.toLocaleString()} · {r.percentage}%
                  </Text>
                </View>
                <View style={[styles.track, { backgroundColor: color + "20" }]}>
                  <View
                    style={[
                      styles.fill,
                      { width: `${r.percentage}%`, backgroundColor: color },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}

      {index < total - 1 && <Divider style={styles.divider} />}
    </View>
  );
}

export default function PollGroupAnalyticsScreen({ route }: any) {
  const { groupId } = route.params;
  const api = useApiClient();
  const theme = useTheme();

  const [data, setData] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/analytics/poll-groups/${groupId}`).then((res: any) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  return (
    <Screen scroll title="Poll Analytics" showBack>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
        </View>
      ) : !data ? null : (
        <View style={styles.container}>
          <Text
            variant="titleLarge"
            style={[styles.groupTitle, { color: theme.colors.onBackground }]}
          >
            {data.groupTitle}
          </Text>
          <Text
            variant="bodySmall"
            style={{ opacity: 0.5, marginBottom: spacing.sm }}
          >
            {data.polls.length} question{data.polls.length !== 1 ? "s" : ""}
          </Text>

          {data.polls.map((poll, i) => (
            <QuestionCard key={poll.pollId} poll={poll} index={i} total={data.polls.length} />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    paddingTop: spacing.lg,
    alignItems: "center",
  },
  container: {
    gap: spacing.sm,
  },
  groupTitle: {
    fontWeight: "700",
    lineHeight: 30,
    marginBottom: 2,
  },
  questionCard: {
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
  },
  questionHeader: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  qNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  questionText: {
    flex: 1,
    fontWeight: "600",
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  barsContainer: {
    gap: spacing.sm,
  },
  barRow: {
    gap: 4,
  },
  barLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  track: {
    height: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 8,
  },
  divider: {
    marginTop: spacing.xs,
  },
});
