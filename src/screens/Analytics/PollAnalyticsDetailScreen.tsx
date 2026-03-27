import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme, ActivityIndicator } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";
import { useApiClient } from "../../hooks/common/useApiClient";

type PollResult = {
  label: string;
  count: number;
  percentage: number;
};

// Distinct colours for up to 6 options; falls back to primary tint for more
const OPTION_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#f97316", // orange
  "#10b981", // green
  "#ef4444", // red
  "#facc15", // yellow
];

function getOptionColor(index: number, label: string): string {
  const lower = label.toLowerCase();
  if (lower === "yes")    return "#22c55e";
  if (lower === "no")     return "#ef4444";
  if (lower === "maybe")  return "#facc15";
  return OPTION_COLORS[index % OPTION_COLORS.length];
}

export default function PollAnalyticsDetailScreen({ route }: any) {
  const { pollId, question } = route.params;
  const api = useApiClient();
  const theme = useTheme();

  const [results, setResults] = useState<PollResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/analytics/polls/${pollId}`).then((res: any) => {
      setResults(res.results);
      setTotalVotes(res.totalVotes);
      setLoading(false);
    });
  }, []);

  const topResult = results.reduce(
    (best, r) => (r.count > best.count ? r : best),
    results[0] ?? { label: "", count: 0, percentage: 0 }
  );

  return (
    <Screen scroll title="Poll Results" showBack>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
        </View>
      ) : (
        <View style={styles.container}>
          {/* Question */}
          {question ? (
            <Text
              variant="titleLarge"
              style={[styles.question, { color: theme.colors.onBackground }]}
            >
              {question}
            </Text>
          ) : null}

          {/* Summary row */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
              <MaterialCommunityIcons name="vote" size={22} color={theme.colors.primary} />
              <Text variant="headlineMedium" style={{ fontWeight: "700" }}>
                {totalVotes.toLocaleString()}
              </Text>
              <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                Total Votes
              </Text>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
              {totalVotes === 0 ? (
                <>
                  <MaterialCommunityIcons name="chart-timeline-variant" size={22} color={theme.colors.onSurfaceVariant} />
                  <Text variant="titleMedium" style={{ fontWeight: "600", opacity: 0.5 }}>
                    No votes yet
                  </Text>
                  <Text variant="bodySmall" style={{ opacity: 0.4 }}>
                    Check back later
                  </Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="trophy-outline"
                    size={22}
                    color={getOptionColor(
                      results.findIndex((r) => r.label === topResult.label),
                      topResult.label
                    )}
                  />
                  <Text
                    variant="headlineSmall"
                    style={{ fontWeight: "700" }}
                    numberOfLines={1}
                  >
                    {topResult.label}
                  </Text>
                  <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                    Leading
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Result bars */}
          <View style={[styles.resultsCard, { backgroundColor: theme.colors.surface }]}>
            <Text
              variant="labelLarge"
              style={[styles.resultsLabel, { color: theme.colors.onSurfaceVariant }]}
            >
              BREAKDOWN
            </Text>

            {results.map((r, i) => {
              const color = getOptionColor(i, r.label);
              return (
                <View key={i} style={styles.resultRow}>
                  <View style={styles.resultTopRow}>
                    <View style={styles.resultLabelRow}>
                      <View style={[styles.colorDot, { backgroundColor: color }]} />
                      <Text variant="titleSmall" style={{ fontWeight: "600" }}>
                        {r.label}
                      </Text>
                    </View>
                    <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                      {r.count.toLocaleString()} votes
                    </Text>
                  </View>

                  {/* Track */}
                  <View style={[styles.track, { backgroundColor: color + "20" }]}>
                    <View
                      style={[
                        styles.fill,
                        { width: `${r.percentage}%`, backgroundColor: color },
                      ]}
                    />
                  </View>

                  <Text
                    variant="labelMedium"
                    style={{ fontWeight: "700", color, alignSelf: "flex-end" }}
                  >
                    {r.percentage}%
                  </Text>
                </View>
              );
            })}
          </View>
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
    gap: spacing.md,
  },
  question: {
    fontWeight: "700",
    lineHeight: 30,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: spacing.md,
    gap: 4,
    alignItems: "flex-start",
  },
  resultsCard: {
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.md,
  },
  resultsLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  resultRow: {
    gap: spacing.xs,
  },
  resultTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  track: {
    height: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 10,
  },
});
