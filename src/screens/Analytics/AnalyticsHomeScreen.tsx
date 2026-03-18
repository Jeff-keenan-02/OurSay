import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Avatar, useTheme } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";

export default function AnalyticsHomeScreen({ navigation }: any) {
  const theme = useTheme();

  return (
    <Screen
      scroll
      title="Analytics"
      subtitle="Explore anonymous voting results."
    >
      <View style={styles.container}>
        <AnalyticsCard
          icon="chart-bar"
          title="Poll Analytics"
          description="View aggregated poll voting results."
          onPress={() => navigation.navigate("PollAnalyticsList")}
        />

        <AnalyticsCard
          icon="file-document-outline"
          title="Petition Analytics"
          description="View petition support statistics."
          onPress={() => navigation.navigate("PetitionAnalyticsList")}
        />
      </View>
    </Screen>
  );
}

function AnalyticsCard({ icon, title, description, onPress }: any) {
  const theme = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Avatar.Icon icon={icon} size={44} />
        <View style={{ flex: 1 }}>
          <Text variant="titleMedium">{title}</Text>
          <Text variant="bodyMedium" style={{ opacity: 0.6 }}>
            {description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: 20,
    gap: spacing.md,
  },
});