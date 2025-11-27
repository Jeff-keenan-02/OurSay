import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, useTheme } from "react-native-paper";
import { timeAgo } from "../../utils/timeAgo";

interface Props {
  title: string;
  body: string;
  username?: string | null;
  created_at: string;
}

export function DiscussionHeader({ title, body, username, created_at }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* TITLE */}
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>
        {title}
      </Text>

      {/* META */}
      <Text style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
        Posted by {username ?? "Anonymous"} • {timeAgo(created_at)}
      </Text>

      {/* BODY CARD */}
      <Card
        mode="contained"
        style={[styles.bodyCard, { backgroundColor: theme.colors.surface }]}
      >
        <Card.Content>
          <Text style={[styles.bodyText, { color: theme.colors.onSurface }]}>
            {body}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    marginBottom: 12,
  },
  bodyCard: {
    borderRadius: 12,
    paddingVertical: 12,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 22,
  },
});