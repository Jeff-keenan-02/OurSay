import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";

export default function PetitionAnalyticsListScreen({ navigation }: any) {
  const theme = useTheme();

  // Replace with real API later
  const mockPetitions = [
    { id: 1, title: "Improve public transport funding" },
    { id: 2, title: "Increase climate action investment" },
  ];

  return (
    <Screen
      scroll
      title="Petition Analytics"
      subtitle="Select a petition to view aggregated support."
    >
      <View style={styles.container}>
        {mockPetitions.map((petition) => (
          <TouchableOpacity
            key={petition.id}
            onPress={() =>
              navigation.navigate("PetitionAnalyticsDetail", {
                petitionId: petition.id,
              })
            }
          >
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Text variant="titleMedium">{petition.title}</Text>
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