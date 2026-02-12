import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Text, IconButton, Divider, useTheme } from "react-native-paper";
import { TrendingCardData } from "../../types/trendingCardData";

type Props = {
  data: TrendingCardData;
  onPress: () => void;
  onVote?: (id: number, direction: "up" | "down") => void;
};

export default function TrendingEngagementCard({
  data,
  onPress,
  onVote,
}: Props) {
  const theme = useTheme();
  const {
    id,
    title,
    description,
    upvotes,
    downvotes,
    comment_count,
  } = data;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={styles.sectionWrapper}>
        <Card
          mode="elevated"
          style={[
            styles.discussionCard,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          {(
            <View style={styles.tag}>
              <Text style={styles.tagText}>🔥 Trending</Text>
            </View>
          )}

          <Card.Content>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
              {title}
            </Text>

            <Text
              numberOfLines={2}
              style={[styles.content, { color: theme.colors.onSurfaceVariant }]}
            >
              {description || "No description provided."}
            </Text>

            <Divider style={{ marginVertical: 12 }} />


              {data.type === "discussion" && (
            <View style={styles.row}>
              <View style={styles.voteGroup}>
                <IconButton
                  icon="thumb-up"
                  size={20}
                  iconColor={theme.colors.primary}
                  onPress={() => onVote?.(data.id, "up")}
                />
                <Text>{data.upvotes}</Text>
              </View>

              <View style={styles.voteGroup}>
                <IconButton
                  icon="thumb-down"
                  size={20}
                  iconColor={theme.colors.primary}
                  onPress={() => onVote?.(data.id, "down")}
                />
                <Text>{data.downvotes}</Text>
              </View>

              <View style={styles.voteGroup}>
                <IconButton icon="comment" size={20} iconColor={theme.colors.primary} />
                <Text>{data.comment_count}</Text>
              </View>
            </View>
          )}
          {data.type === "poll" && (
  <View style={styles.row}>
    <Text style={{ color: theme.colors.primary }}>
      Swipe to vote
    </Text>
  </View>
)}
          {data.type === "petition" && (
  <View style={styles.row}>
    <Text style={{ color: theme.colors.primary }}>
      {data.signatures} signatures
    </Text>
  </View>
)}

          </Card.Content>
        </Card>
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
sectionWrapper: {
  width: 260,  // <--- force properly sized cards
  marginHorizontal: 4,
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
  height: 4,
  width: "100%",
  borderTopLeftRadius: 18,
  borderTopRightRadius: 18,
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

  voteGroup: {
    flexDirection: "row",
    alignItems: "center",
  },

  voteCount: {
    fontSize: 14,
    marginLeft: -4,
  },

  title: {
  fontSize: 18,
  fontWeight: "600",
  marginBottom: 10,
},

content: {
  fontSize: 14,
  marginBottom: 12,
},

row: {
  flexDirection: "row",
  alignItems: "center",
  gap: 24,
},
});