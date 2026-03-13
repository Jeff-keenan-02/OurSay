import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { Avatar, useTheme } from "react-native-paper";
import { VERIFICATION_TIERS, VerificationTier } from "../../types/verification";
import { formatExpiry } from "../../utils/formatExpiry";
import { spacing } from "../../theme/spacing";

export function TierAccessCard({
  tier,
  expiresAt,
}: {
  tier: VerificationTier;
  expiresAt: string | null;
}) {
  const theme = useTheme();
  const tierInfo = VERIFICATION_TIERS[tier];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: tierInfo.color + "40",
        },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.title,
            { color: tierInfo.color },
          ]}
        >
          {tierInfo.label}
        </Text>

        <Avatar.Icon
          size={36}
          icon={tierInfo.icon}
          style={{
            backgroundColor: tierInfo.color + "20",
          }}
          color={tierInfo.color}
        />
      </View>

      {/* Description */}
      <Text style={[styles.description, { color: theme.colors.onSurface }]}>
        {tierInfo.description}
      </Text>

      <View style={styles.divider} />

      {/* Permissions */}
      <View style={styles.permissionsContainer}>
        {tierInfo.permissions.map((p, i) => (
          <View key={i} style={styles.permissionRow}>
            <Avatar.Icon
              size={20}
              icon="check"
              style={{
                backgroundColor: tierInfo.color + "15",
              }}
              color={tierInfo.color}
            />
            <Text
              style={[
                styles.permissionText,
                { color: theme.colors.onSurface },
              ]}
            >
              {p}
            </Text>
          </View>
        ))}
      </View>

      {expiresAt && (
        <>
          <View style={styles.divider} />
          <View style={styles.footerRow}>
            <Text
              style={[
                styles.expiry,
                { color: tierInfo.color },
              ]}
            >
              Expires {formatExpiry(expiresAt)}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
  },

  description: {
    marginTop: spacing.sm,
    fontSize: 14,
    opacity: 0.9,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginVertical: spacing.md,
  },

  permissionsContainer: {
    gap: spacing.sm,
  },

  permissionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  permissionText: {
    fontSize: 14,
    fontWeight: "500",
  },

  footerRow: {
    alignItems: "flex-end",
  },

  expiry: {
    fontSize: 13,
    fontWeight: "600",
  },
});