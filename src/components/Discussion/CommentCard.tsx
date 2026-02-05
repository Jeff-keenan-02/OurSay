import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { timeAgo } from "../../utils/timeAgo";
import { VerificationTier } from "../../types/VerificationTier";
import { TierBadge } from "../Verification/TierBadge";

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
      <View style={styles.headerRow}>
        <Text
          style={[styles.username, { color: theme.colors.primary }]}>
          {username ?? "Anonymous"}
          <TierBadge
          tier={verificationTier}
          onPress={() => {}}/>
        </Text>
        
        <Text
          style={[styles.time, { color: theme.colors.onSurfaceVariant }]}>
          {timeAgo(created_at)}
        </Text>
      </View>

      <Text style={[styles.body, { color: theme.colors.onSurface }]}>
        {body}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  username: {
    fontWeight: "600",
  },
  time: {
    fontSize: 12,
  },
  body: {
    fontSize: 15,
    lineHeight: 20,
  },
});