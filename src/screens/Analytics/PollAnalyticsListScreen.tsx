import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";

export default function PollAnalyticsListScreen({ navigation }: any) {
  const theme = useTheme();

  // Replace with real API later
  const mockPolls = [
    { id: 1, title: "Should Ireland adopt policy X?" },
    { id: 2, title: "Increase renewable energy funding?" },
  ];

  return (
    <Screen
      scroll
      title="Poll Analytics"
      subtitle="Select a poll to view aggregated results."
    >
      <View style={styles.container}>
        {mockPolls.map((poll) => (
          <TouchableOpacity
            key={poll.id}
            onPress={() =>
              navigation.navigate("PollAnalyticsDetail", { pollId: poll.id })
            }
          >
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Text variant="titleMedium">{poll.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  card: {
    padding: spacing.lg,
    borderRadius: 20,
  },
});