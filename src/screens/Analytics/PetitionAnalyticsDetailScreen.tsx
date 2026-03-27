import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme, ActivityIndicator } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";
import { useApiClient } from "../../hooks/common/useApiClient";

type PetitionData = {
  totalSignatures: number;
  goal: number;
  percentage: number;
  remaining: number;
};

export default function PetitionAnalyticsDetailScreen({ route }: any) {
  const { petitionId, title } = route.params;
  const api = useApiClient();
  const theme = useTheme();

  const [data, setData] = useState<PetitionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/analytics/petitions/${petitionId}`).then((res: any) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const progressColor = data
    ? data.percentage >= 100
      ? "#22c55e"
      : data.percentage >= 50
      ? "#3b82f6"
      : "#f97316"
    : "#3b82f6";

  const clampedPct = data ? Math.min(data.percentage, 100) : 0;

  return (
    <Screen scroll title="Petition Analytics" showBack>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
        </View>
      ) : data ? (
        <View style={styles.container}>
          {/* Title */}
          {title ? (
            <Text
              variant="titleLarge"
              style={[styles.titleText, { color: theme.colors.onBackground }]}
            >
              {title}
            </Text>
          ) : null}

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <MaterialCommunityIcons name="account-group" size={22} color={progressColor} />
              <Text variant="headlineMedium" style={{ fontWeight: "700" }}>
                {data.totalSignatures.toLocaleString()}
              </Text>
              <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                Signatures
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <MaterialCommunityIcons name="flag-outline" size={22} color={theme.colors.secondary} />
              <Text variant="headlineMedium" style={{ fontWeight: "700" }}>
                {data.goal.toLocaleString()}
              </Text>
              <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                Goal
              </Text>
            </View>
          </View>

          {/* Progress card */}
          <View style={[styles.progressCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.progressHeader}>
              <View>
                <Text variant="labelLarge" style={{ fontWeight: "700", color: theme.colors.onSurfaceVariant, fontSize: 11, letterSpacing: 0.8 }}>
                  SIGNATURES TOWARD GOAL
                </Text>
                <Text variant="bodySmall" style={{ opacity: 0.55, marginTop: 2 }}>
                  {data.totalSignatures.toLocaleString()} of {data.goal.toLocaleString()} needed
                </Text>
              </View>
              <Text
                variant="headlineSmall"
                style={{ fontWeight: "800", color: progressColor }}
              >
                {clampedPct}%
              </Text>
            </View>

            {/* Track */}
            <View style={[styles.track, { backgroundColor: progressColor + "20" }]}>
              <View
                style={[
                  styles.fill,
                  { width: `${clampedPct}%`, backgroundColor: progressColor },
                ]}
              />
            </View>

            {/* Supporting stats */}
            <View style={styles.supportRow}>
              <View style={styles.supportItem}>
                <Text variant="titleMedium" style={{ fontWeight: "700" }}>
                  {data.remaining.toLocaleString()}
                </Text>
                <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                  Remaining
                </Text>
              </View>

              <View style={[styles.supportDivider, { backgroundColor: theme.colors.outline }]} />

              <View style={styles.supportItem}>
                <MaterialCommunityIcons
                  name={data.percentage >= 100 ? "check-circle" : "clock-outline"}
                  size={24}
                  color={data.percentage >= 100 ? "#22c55e" : theme.colors.onSurfaceVariant}
                />
                <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                  {data.percentage >= 100 ? "Goal Reached" : "In Progress"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      ) : null}
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
  titleText: {
    fontWeight: "700",
    lineHeight: 30,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: spacing.md,
    gap: 4,
    alignItems: "flex-start",
  },
  progressCard: {
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  track: {
    height: 14,
    borderRadius: 10,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 10,
  },
  supportRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: spacing.xs,
  },
  supportItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  supportDivider: {
    width: 1,
    height: 40,
    opacity: 0.2,
  },
});
