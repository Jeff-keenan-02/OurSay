import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";
import { useApiClient } from "../../hooks/common/useApiClient";

export default function PetitionAnalyticsDetailScreen({ route }: any) {
  const { petitionId } = route.params;
  const api = useApiClient();

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get(`/analytics/petitions/${petitionId}`).then((res: any) => {
      setData(res);
    });
  }, []);

  if (!data) return null;

  return (
    <Screen
      scroll
      title="Petition Analytics"
      subtitle="Anonymous aggregated support."
    >
      {/* 🔹 Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.summaryTitle}>Total Support</Text>
          <Text style={styles.summaryValue}>{data.totalSignatures}</Text>
          <Text style={styles.goalText}>Goal: {data.goal}</Text>
        </Card.Content>
      </Card>

      {/* 🔹 Progress */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>Progress</Text>

          <View style={styles.barContainer}>
            <View
              style={[
                styles.barFill,
                { width: `${data.percentage}%` },
              ]}
            />
          </View>

          <Text style={styles.percent}>{data.percentage}% complete</Text>
          <Text style={styles.remaining}>
            {data.remaining} remaining
          </Text>
        </Card.Content>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    marginTop: spacing.md,
    borderRadius: 20,
  },

  summaryTitle: {
    opacity: 0.6,
  },

  summaryValue: {
    fontSize: 28,
    fontWeight: "700",
  },

  goalText: {
    opacity: 0.6,
    marginTop: 4,
  },

  card: {
    marginTop: spacing.lg,
    borderRadius: 20,
  },

  label: {
    fontWeight: "600",
    marginBottom: spacing.sm,
  },

  barContainer: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 10,
  },

  percent: {
    marginTop: spacing.sm,
    fontWeight: "600",
  },

  remaining: {
    opacity: 0.6,
    marginTop: 2,
  },
});