import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { timeAgo } from "../../utils/timeAgo";
import { VerificationTier } from "../../types/verification";
import { TierBadge } from "../common/TierBadge";

interface Props {
  username?: string | null;
  body: string;
  created_at: string;
  verificationTier: VerificationTier;
}

export function CommentCard({ username, body, created_at, verificationTier }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>

      {/* Header: icon + username + tier badge */}
      <View style={styles.header}>
        <View style={styles.userRow}>
          <MaterialCommunityIcons name="account-circle-outline" size={15} color={theme.colors.primary} />
          <Text style={[styles.username, { color: theme.colors.primary }]}>
            {username ?? "Anonymous"}
          </Text>
        </View>
        <TierBadge tier={verificationTier} />
      </View>

      {/* Body */}
      <Text style={[styles.body, { color: theme.colors.onSurface }]}>
        {body}
      </Text>

      {/* Time */}
      <Text style={[styles.time, { color: theme.colors.onSurfaceVariant }]}>
        {timeAgo(created_at)}
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  username: {
    fontWeight: "600",
    fontSize: 14,
  },

  time: {
    fontSize: 12,
    marginTop: 8,
    textAlign: "right",
    opacity: 0.5,
  },

  body: {
    fontSize: 15,
    lineHeight: 22,
  },
});