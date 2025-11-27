import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Text, IconButton, useTheme, Badge } from "react-native-paper";

type Discussion = {
  id: number;
  title: string;
  body: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  isTrending?: boolean; // optional flag
};

type Props = {
  discussion: Discussion;
  onPress: () => void;
  onVote: (id: number, direction: "up" | "down") => void;
};

export default function DiscussionCard({ discussion, onPress, onVote }: Props) {
  const theme = useTheme();
  const { id, title, body, upvotes, downvotes, comment_count, isTrending } =
    discussion;

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {isTrending && (
          <View style={styles.trendingBadgeWrapper}>
            <Badge style={styles.trendingBadge}>Trending</Badge>
          </View>
        )}

        <Card.Title
          title={title}
          titleStyle={{ color: theme.colors.onSurface, fontSize: 19 }}
        />

        <Card.Content>
          <Text numberOfLines={3} style={{ color: theme.colors.onSurfaceVariant }}>
            {body}
          </Text>

          <View style={styles.row}>
            <IconButton
              icon="thumb-up"
              size={20}
              iconColor={theme.colors.primary}
              onPress={() => onVote(id, "up")}
            />
            <Text style={{ color: theme.colors.onSurface }}>{upvotes}</Text>

            <IconButton
              icon="thumb-down"
              size={20}
              iconColor={theme.colors.primary}
              onPress={() => onVote(id, "down")}
            />
            <Text style={{ color: theme.colors.onSurface }}>{downvotes}</Text>

            <IconButton icon="comment" size={20} iconColor={theme.colors.primary} />
            <Text style={{ color: theme.colors.onSurface }}>{comment_count}</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    borderRadius: 16,
    paddingBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
  trendingBadgeWrapper: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 20,
  },
  trendingBadge: {
    backgroundColor: "#ff9800",
    color: "black",
    fontWeight: "bold",
    fontSize: 12,
  },
});