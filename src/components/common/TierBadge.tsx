import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { VERIFICATION_TIERS, VerificationTier } from "../../types/verification";


type Props = {
  tier: VerificationTier;
  onPress: () => void;
};
export function TierBadge({ tier, onPress }: Props) {
  const theme = useTheme();

  const tierInfo = VERIFICATION_TIERS[tier] ?? VERIFICATION_TIERS[0];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        {
          borderColor: tierInfo.color,
          backgroundColor: theme.colors.surface,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={tierInfo.label}
    >
      <MaterialCommunityIcons
        name={tierInfo.icon}
        size={18}
        color={tierInfo.color}
        style={styles.icon}
      />

      <Text
        variant="labelMedium"
        style={[styles.text, { color: tierInfo.color }]}
      >
        T{tier}
      </Text>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 0,
    marginRight: 0, // spacing from right edge of header
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: "700",
  },
});