// components/SwipeDeck/SwipeCard.tsx
import React from "react";
import { Card, Text, useTheme } from "react-native-paper";
import { StyleSheet } from "react-native";

export default function SwipeCard({ card }: { card: any }) {
  const theme = useTheme();

  if (!card) {
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Card.Title title="Loading…" />
      </Card>
    );
  }
  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
      <Card.Title
        title={card.title}
        titleStyle={{
          color: theme.colors.onSurface,
          fontSize: 22,
          fontWeight: "700",
        }}
      />
      <Card.Content>
        <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 16 }}>
          {card.description || "No description"}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 420,
    padding: 24,
    borderRadius: 20,
    justifyContent: "center",
  },
});