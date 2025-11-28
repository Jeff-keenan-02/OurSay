import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Text, useTheme, Badge } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

type Discussion = {
  id: number;
  title: string;
  body: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  isTrending?: boolean;
};

type Props = {
  discussion: Discussion;
  onPress: () => void;
  onVote: (id: number, dir: "up" | "down") => void;
};

export default function DiscussionCard({ discussion, onPress, onVote }: Props) {
  const theme = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        
        {/* TRENDING TAG */}
        {discussion.isTrending && (
          <View style={styles.tagWrapper}>
            <Text style={[styles.tag, { color: theme.colors.primary }]}>
              🔥 Trending
            </Text>
          </View>
        )}

        {/* TITLE */}
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          {discussion.title}
        </Text>

        {/* BODY PREVIEW */}
        <Text
          numberOfLines={3}
          style={[
            styles.body,
            { color: theme.colors.onSurfaceVariant }
          ]}
        >
          {discussion.body}
        </Text>

        {/* FOOTER — VOTES & COMMENTS */}
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <MaterialCommunityIcons
              name="thumb-up-outline"
              size={20}
              color={theme.colors.primary}
              onPress={() => onVote(discussion.id, "up")}
            />
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              {discussion.upvotes}
            </Text>
          </View>

          <View style={styles.footerItem}>
            <MaterialCommunityIcons
              name="thumb-down-outline"
              size={20}
              color={theme.colors.primary}
              onPress={() => onVote(discussion.id, "down")}
            />
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              {discussion.downvotes}
            </Text>
          </View>

          <View style={styles.footerItem}>
            <MaterialCommunityIcons
              name="comment-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              {discussion.comment_count}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 20,
    marginVertical: 10,
    gap: 8,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },

  body: {
    fontSize: 15,
    lineHeight: 22,
  },

  footer: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },

  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  tagWrapper: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 160, 0, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },

  tag: {
    fontSize: 13,
    fontWeight: "600",
  },
});