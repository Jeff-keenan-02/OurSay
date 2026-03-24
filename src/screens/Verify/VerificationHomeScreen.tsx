import React, { useContext, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Text, useTheme, Avatar, ActivityIndicator } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";
import { VerificationTier } from "../../types/verification";
import { resolveVerificationStatus } from "../../utils/verificationProgress";
import { useVerificationSummary } from "../../hooks/verify/useVerificationSummary";
import { VERIFICATION_TIERS } from "../../types/verification";
import { TierAccessCard } from "../../hooks/common/TierAccessCard";


type VerificationOption = {
  key: string;
  level: VerificationTier;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  lockedMessage: string;
  onPress: () => void;
};

export default function VerificationHomeScreen({ navigation }: any) {
  const theme = useTheme();


  const { data, loading, reload } = useVerificationSummary();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [])
  );


  if (loading) {
    return (
      <Screen
        scroll
        title="Verification"
        subtitle="Checking verification status..."
      >
        <View style={{ padding: spacing.md }}>
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }
  const userTier = (data?.currentTier ?? 0) as VerificationTier;
  const tierInfo = VERIFICATION_TIERS[userTier];

  const options: VerificationOption[] = [
    {
      key: "liveness",
      level: 0,
      title: "Human Verification",
      description: "Confirm you are a real person using a quick liveness check.",
      icon: "account-check",
      iconColor: theme.colors.primary,
      lockedMessage: "Complete account creation first.",
      onPress: () => navigation.navigate("LivenessIntro"),
    },
    {
      key: "passport",
      level: 1,
      title: "Citizen Verification",
      description: "Verify citizenship using a valid passport.",
      icon: "passport",
      iconColor: "#FACC15",
      lockedMessage: "Complete Human Verification first.",
      onPress: () => navigation.navigate("PassportIntro"),
    },
    {
      key: "residence",
      level: 2,
      title: "Location Verification",
      description: "Confirm your local residency by performing a basic ip check.",
      icon: "home-map-marker",
      iconColor: "#38BDF8",
      lockedMessage: "Complete Citizen Verification first.",
      onPress: () => navigation.navigate("ResidenceIntro"),
    },
  ];

  return (
    <Screen
      scroll
    >
      {/* -------- Verification Status Card -------- */}

      <TierAccessCard
        tier={userTier}
        expiresAt={data?.expiresAt ?? null}
      />


      {/* -------- Verification Steps  -------- */}
      {/* <Text variant="titleMedium" style={styles.sectionLabel}>
        Verification Steps
      </Text> */}
      <View style={styles.list}>
        {options.map((option) => {
          const status = resolveVerificationStatus(userTier, option.level);

          return (
            <TouchableOpacity
              key={option.key}
              activeOpacity={status === "available" ? 0.8 : 1}
              onPress={() => {

                if (status === "locked") {
                  Alert.alert("Verification Locked", option.lockedMessage);
                  return;
                }

                if (status === "completed") {
                  Alert.alert("Completed", "You have already completed this step.");
                  return;
                }

                option.onPress();
              }}
            >
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.colors.surface,
                    opacity: status === "locked" ? 0.5 : 1,
                  },
                ]}
              >
                <Avatar.Icon
                  icon={option.icon}
                  size={44}
                  style={{
                    backgroundColor: option.iconColor + "22",
                  }}
                  color={option.iconColor}
                />

                <View style={styles.textContainer}>
                  <Text variant="titleMedium">
                    {option.title}
                  </Text>

                  <Text variant="bodyMedium" style={{ opacity: 0.7 }}>
                    {option.description}
                  </Text>
                </View>

                <View
                
                  style={[
                    styles.statusBadge,
                    status === "completed" && styles.completedBadge,
                    status === "available" && styles.availableBadge,
                    status === "locked" && styles.lockedBadge,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {status === "completed" && "Completed"}
                    {status === "available" && "Available"}
                    {status === "locked" && "Locked"}
                  </Text>
                  <Text style={styles.unlockText}>
                    Unlocks Tier {option.level + 1}
                  </Text>
                </View>

              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      </Screen>
      );
}

const styles = StyleSheet.create({
  statusBadge: {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  completedBadge: {
    backgroundColor: "#16a34a20",
  },

  availableBadge: {
    borderWidth: 1,
    borderColor: "#facc15",
  },

  lockedBadge: {
    backgroundColor: "#64748b20",
  },

  unlockText: {
    fontSize: 12,
    opacity: 0.6,
  },
  list: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 16,
    gap: spacing.md,
  },
  textContainer: {
    flex: 1,   
    gap: 4,
  },
  
statusTitle: {
  fontWeight: "600",
  marginBottom: 4,
},

statusSubtitle: {
  opacity: 0.65,
},
badgeRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  marginBottom: spacing.xs,
},

nextText: {
  marginTop: spacing.xs,
  fontSize: 12,
  opacity: 0.5,
},

statusCard: {
  padding: spacing.lg,
  borderRadius: 20,
  marginBottom: spacing.lg,
  alignItems: "center",
},

tierTitle: {
  fontWeight: "600",
  marginBottom: spacing.sm,
},

divider: {
  height: 1,
  backgroundColor: "rgba(255,255,255,0.08)",
  marginBottom: spacing.md,
},

contentRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
},

descriptionContainer: {
  flex: 1,
},

descriptionText: {
  opacity: 0.8,
},

footerRow: {
  marginTop: spacing.md,
  alignItems: "flex-end",
},

expiryText: {
  fontSize: 12,
  opacity: 0.7,
  fontWeight: "500",
},
});