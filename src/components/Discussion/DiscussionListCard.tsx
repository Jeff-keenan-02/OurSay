import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Divider, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { DiscussionListItem } from "../../types/Discussion";
import { AccessStatusChip } from "../common/AccessStatusChip";
import { spacing } from "../../theme/spacing";
import { VerificationTier } from "../../types/verification";

const ACCENT = "#6366f1";

type Props = {
  item: DiscussionListItem;
  onPress: () => void;
  onVote: (id: number, direction: "up" | "down") => void;
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });
}

export default function DiscussionListCard({ item, onPress, onVote }: Props) {
  const theme = useTheme();
  const tier = item.verification_tier as VerificationTier | undefined;
  const [myVote, setMyVote] = useState<"up" | "down" | null>(null);

  const handleVote = (direction: "up" | "down") => {
    if (myVote === direction) return; // already voted this way
    setMyVote(direction);
    onVote(item.id, direction);
  };

  const upActive   = myVote === "up";
  const downActive = myVote === "down";

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.accent} />
      <View style={styles.cardContent}>

        <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.body}>
          <View style={styles.topRow}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={2}>
              {item.title}
            </Text>
            {tier != null && tier > 0 && (
              <AccessStatusChip variant="tier" requiredTier={tier} />
            )}
          </View>

          {!!item.body && (
            <Text style={[styles.preview, { color: theme.colors.onSurfaceVariant }]} numberOfLines={3}>
              {item.body}
            </Text>
          )}

          <View style={styles.meta}>
            <MaterialCommunityIcons name="account-circle-outline" size={13} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.metaText, { color: theme.colors.primary }]}>Created by </Text>
            <Text style={[styles.metaText, styles.metaAuthor, { color: theme.colors.primary }]}>
              {item.created_by}
            </Text>
            <Text style={[styles.metaText, { color: theme.colors.primary }]}>·</Text>
            <Text style={[styles.metaText, { color: theme.colors.primary }]}>
              {formatDate(item.created_at)}
            </Text>
          </View>
        </TouchableOpacity>

        <Divider />

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.voteAction, upActive && { ...styles.voteActiveBox, borderColor: theme.colors.primary + "60", backgroundColor: theme.colors.primary + "18" }]}
            onPress={() => handleVote("up")}
          >
            <MaterialCommunityIcons
              name={upActive ? "thumb-up" : "thumb-up-outline"}
              size={18}
              color={upActive ? theme.colors.primary : theme.colors.primary}
            />
            <Text style={[styles.voteCount, { color: theme.colors.primary }]}>{item.upvotes}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.voteAction, downActive && { ...styles.voteActiveBox, borderColor: "#f87171" + "60", backgroundColor: "#f87171" + "18" }]}
            onPress={() => handleVote("down")}
          >
            <MaterialCommunityIcons
              name={downActive ? "thumb-down" : "thumb-down-outline"}
              size={18}
              color={downActive ? "#f87171" : theme.colors.primary}
            />
            <Text style={[styles.voteCount, { color: downActive ? "#f87171" : theme.colors.primary }]}>{item.downvotes}</Text>
          </TouchableOpacity>

          <View style={[styles.voteAction, styles.commentStat]}>
            <MaterialCommunityIcons name="comment-outline" size={18} color={theme.colors.primary} />
            <Text style={[styles.voteCount, { color: theme.colors.primary }]}>{item.comment_count}</Text>
          </View>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
  },
  accent: {
    width: 4,
    backgroundColor: ACCENT,
  },
  cardContent: {
    flex: 1,
    flexDirection: "column",
  },
  body: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
  },
  preview: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.7,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  author: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,

  },
  metaAuthor: {
    fontWeight: "600",
    opacity: 1,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.lg,
  },
  voteAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  voteActiveBox: {
    borderRadius: 20,
    borderWidth: 1,
  },
  commentStat: {
    marginLeft: "auto",
  },
  voteCount: {
    fontSize: 14,
    fontWeight: "600",
  },
});
