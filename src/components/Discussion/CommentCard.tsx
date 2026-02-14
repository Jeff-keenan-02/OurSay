import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { timeAgo } from "../../utils/timeAgo";
import { VerificationTier } from "../../types/VerificationTier";
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
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
    >

    
    {/* LEFT SIDE → Username + Badge */}
    <View style={styles.userRow}>
      <Text
        style={[styles.username, { color: theme.colors.primary }]}
      >
        {username ?? "Anonymous"}
      </Text>

      <TierBadge
        tier={verificationTier}
        onPress={() => {}}
      />
    </View>

      {/* COMMENT BODY */}
    <Text style={[styles.body, { color: theme.colors.onSurface }]}>
      {body}
    </Text>

    {/* FOOTER ROW */}
    <View style={styles.footerRow}>
      <Text
        style={[styles.time, { color: theme.colors.onSurfaceVariant }]}
      >
        {timeAgo(created_at)}
      </Text>
    </View>
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

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  username: {
    fontWeight: "600",
    fontSize: 14,
  },

  time: {
    fontSize: 12,
  },
  footerRow: {
  marginTop: 8,
  alignItems: "flex-end",
},

  body: {
    fontSize: 15,
    lineHeight: 22,
  },
});