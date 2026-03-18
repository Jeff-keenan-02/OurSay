import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme, Card } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";
import { useApiClient } from "../../hooks/common/useApiClient";

export default function PollAnalyticsDetailScreen({ route }: any) {
  const { pollId } = route.params;
  const api = useApiClient();
  const theme = useTheme();

  type PollResult = {
    label: string;
    count: number;
    percentage: number;
  };

  const [results, setResults] = useState<PollResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    api.get(`/analytics/polls/${pollId}`).then((res: any) => {
      setResults(res.results);
      setTotalVotes(res.totalVotes);
    });
  }, []);

  return (
    <Screen
      scroll
      title="Poll Results"
      subtitle="Anonymous aggregated voting data."
    >
      {/* 🧠 Summary Card */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.summaryTitle}>Total Votes</Text>
          <Text style={styles.summaryValue}>{totalVotes}</Text>
        </Card.Content>
      </Card>

      {/* 📊 Results */}
      <View style={styles.container}>
        {results.map((r, i) => {
          const color =
            r.label === "Yes" ? "#22c55e" : "#ef4444"; // green / red

          return (
            <Card key={i} style={styles.card}>
              <Card.Content>
                {/* Top Row */}
                <View style={styles.row}>
                  <Text style={styles.label}>{r.label}</Text>
                  <Text style={styles.count}>{r.count} votes</Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${r.percentage}%`,
                        backgroundColor: color,
                      },
                    ]}
                  />
                </View>

                {/* Percentage */}
                <Text style={styles.percent}>
                  {r.percentage}%
                </Text>
              </Card.Content>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },

  summaryCard: {
    marginTop: spacing.md,
    borderRadius: 20,
  },

  summaryTitle: {
    opacity: 0.6,
    marginBottom: 4,
  },

  summaryValue: {
    fontSize: 28,
    fontWeight: "700",
  },

  card: {
    borderRadius: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },

  label: {
    fontWeight: "600",
    fontSize: 16,
  },

  count: {
    opacity: 0.6,
  },

  barContainer: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    borderRadius: 10,
  },

  percent: {
    marginTop: spacing.xs,
    fontWeight: "600",
    opacity: 0.7,
  },
});