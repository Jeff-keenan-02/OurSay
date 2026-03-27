import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { VerificationTier, VERIFICATION_TIERS } from "../../types/verification";

type Props =
  | { variant: "locked"; requiredTier: VerificationTier }
  | { variant: "completed" }
  | { variant: "signed" }
  | { variant: "unsigned" }
  | { variant: "tier"; requiredTier: VerificationTier };

export function AccessStatusChip(props: Props) {
  if (props.variant === "completed") {
    return (
      <View style={[styles.chip, styles.completedChip]}>
        <MaterialCommunityIcons name="check-circle" size={13} color="#22c55e" />
        <Text style={[styles.label, { color: "#22c55e" }]}>Completed</Text>
      </View>
    );
  }

  if (props.variant === "signed") {
    return (
      <View style={[styles.chip, styles.signedChip]}>
        <MaterialCommunityIcons name="pen-plus" size={13} color="#f97316" />
        <Text style={[styles.label, { color: "#f97316" }]}>Signed</Text>
      </View>
    );
  }

  if (props.variant === "unsigned") {
    return (
      <View style={[styles.chip, styles.unsignedChip]}>
        <MaterialCommunityIcons name="pen-off" size={13} color="#94a3b8" />
        <Text style={[styles.label, { color: "#94a3b8" }]}>Unsigned</Text>
      </View>
    );
  }

  const tierInfo = VERIFICATION_TIERS[props.requiredTier] ?? VERIFICATION_TIERS[1];
  const meta = { icon: tierInfo.icon, color: tierInfo.color, label: `Tier ${props.requiredTier}` };

  const chipStyle = {
    backgroundColor: meta.color + "20",
    borderColor: meta.color + "60",
  };

  const icon = props.variant === "locked" ? "lock" : meta.icon;

  return (
    <View style={[styles.chip, chipStyle]}>
      <MaterialCommunityIcons name={icon} size={13} color={meta.color} />
      <Text style={[styles.label, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  completedChip: {
    backgroundColor: "#22c55e18",
    borderColor: "#22c55e40",
  },
  signedChip: {
    backgroundColor: "#f9731618",
    borderColor: "#f9731640",
  },
  unsignedChip: {
    backgroundColor: "#94a3b818",
    borderColor: "#94a3b840",
  },
});
