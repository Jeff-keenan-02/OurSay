import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function SwipeCard({ card }: { card: any }) {
  const theme = useTheme();

  if (!card) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text style={[styles.loading, { color: theme.colors.onSurface }]}>
          Loading…
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
        },
      ]}
    >
      <View style={styles.inner}>
        <Text
          style={[
            styles.title,
            { color: theme.colors.onBackground }
          ]}
        >
          {card.title}
        </Text>

        <Text
          style={[
            styles.description,
            { color: theme.colors.onSurfaceVariant }
          ]}
        >
          {card.description || "No description provided"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 420,
    borderRadius: 22,
    padding: 24,
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  inner: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 14,
  },

  description: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    opacity: 0.85,
  },

  loading: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
});