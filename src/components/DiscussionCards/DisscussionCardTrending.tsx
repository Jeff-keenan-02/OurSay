import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Text, IconButton, Divider, useTheme } from "react-native-paper";

type Discussion = {
  id: number;
  title: string;
  body: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
};

type Props = {
  discussion: Discussion;
  onPress: () => void;
  onVote: (id: number, direction: "up" | "down") => void;
};

export default function DiscussionCard({ discussion, onPress, onVote }: Props) {
  const theme = useTheme();
  const { id, title, body, upvotes, downvotes, comment_count } = discussion;

  return (
    <View style={styles.sectionWrapper}>
      <Card
        mode="elevated"
        style={[
          styles.discussionCard,
          { backgroundColor: "rgba(255,255,255,0.05)" },
        ]}
        onPress={onPress}
        theme={{ colors: { surface: theme.colors.surface } }}
      >
        {/* Gradient Bar */}
        <View style={styles.gradientBar} />

        <Card.Content style={{ paddingTop: 12 }}>
          {/* Small TAG */}
          <View style={styles.tag}>
            <Text style={styles.tagText}>Trending</Text>
          </View>

          {/* TITLE */}
          <Text
            numberOfLines={3}
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            {title}
          </Text>

          {/* PREVIEW BODY */}
          <Text
            numberOfLines={2}
            style={[styles.content, { color: theme.colors.onSurfaceVariant }]}
          >
            {body}
          </Text>

          <Divider style={{ marginVertical: 14 }} />

          {/* Votes Row */}
          <View style={styles.row}>
            {/* Upvote Group */}
            <View style={styles.voteGroup}>
              <IconButton
                icon="thumb-up"
                size={20}
                onPress={() => onVote(id, "up")}
                iconColor={theme.colors.primary}
              />
              <Text style={[styles.voteCount, { color: theme.colors.onSurface }]}>
                {upvotes}
              </Text>
            </View>

            {/* Downvote Group */}
            <View style={styles.voteGroup}>
              <IconButton
                icon="thumb-down"
                size={20}
                onPress={() => onVote(id, "down")}
                iconColor={theme.colors.primary}
              />
              <Text style={[styles.voteCount, { color: theme.colors.onSurface }]}>
                {downvotes}
              </Text>
            </View>

            {/* Comments Group */}
            <View style={styles.voteGroup}>
              <IconButton
                icon="comment"
                size={20}
                iconColor={theme.colors.primary}
              />
              <Text style={[styles.voteCount, { color: theme.colors.onSurface }]}>
                {comment_count}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionWrapper: {
    width: "100%",
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  discussionCard: {
    borderRadius: 18,
    borderColor: "#ffffff22",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  gradientBar: {
    height: 6,
    width: "100%",
    backgroundColor: "rgba(78,163,255,0.35)",
  },

  tag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(78,163,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },

  tagText: {
    color: "#A8CFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },

  content: {
    fontSize: 14,
    marginBottom: 4,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  voteGroup: {
    flexDirection: "row",
    alignItems: "center",
  },

  voteCount: {
    fontSize: 14,
    marginLeft: -4,
  },
});