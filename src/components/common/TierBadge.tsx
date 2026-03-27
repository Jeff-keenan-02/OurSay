import React, { useState } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { Text, useTheme, ActivityIndicator } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { VERIFICATION_TIERS, VerificationTier } from "../../types/verification";
import { TierAccessCard } from "../../hooks/common/TierAccessCard";
import { useVerificationSummary } from "../../hooks/verify/useVerificationSummary";

type Props = {
  tier: VerificationTier;
};

export function TierBadge({ tier }: Props) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const { data, loading } = useVerificationSummary();

  const tierInfo = VERIFICATION_TIERS[tier] ?? VERIFICATION_TIERS[0];

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
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
          Tier {tier}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.cardWrapper} onPress={() => {}}>
            {loading ? (
              <ActivityIndicator style={{ padding: 32 }} />
            ) : (
              <TierAccessCard
                tier={tier}
                expiresAt={data?.expiresAt ?? null}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
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
    marginRight: 0,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: "700",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  cardWrapper: {
    width: "100%",
  },
});
