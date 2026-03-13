import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";

export default function PollAnalyticsDetailScreen({ route }: any) {
  const { pollId } = route.params;

  // Mock aggregated results
  const results = [
    { label: "Yes", percentage: 60 },
    { label: "No", percentage: 40 },
  ];

  return (
    <Screen
      scroll
      title="Poll Results"
      subtitle="Anonymous aggregated voting data."
    >
      <View style={styles.container}>
        {results.map((r, i) => (
          <View key={i} style={styles.resultRow}>
            <Text style={styles.label}>{r.label}</Text>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.barFill,
                  { width: `${r.percentage}%` },
                ]}
              />
            </View>
            <Text style={styles.percent}>{r.percentage}%</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
  resultRow: {
    gap: spacing.sm,
  },
  label: {
    fontWeight: "600",
  },
  barContainer: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
  },
  percent: {
    opacity: 0.7,
  },
});