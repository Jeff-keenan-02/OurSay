import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Text, useTheme, ActivityIndicator } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { TouchableOpacity } from "react-native";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";
import { VerificationTier, VERIFICATION_TIERS } from "../../types/verification";
import { resolveVerificationStatus } from "../../utils/verificationProgress";
import { useVerificationSummary } from "../../hooks/verify/useVerificationSummary";
import { TierAccessCard } from "../../hooks/common/TierAccessCard";


const STEP_META = [
  {
    key: "liveness",
    stepTier: 0 as VerificationTier,
    title: "Human Verification",
    description: "Confirm you are a real person with a quick liveness check.",
    icon: "account-check",
    lockedBy: null,
    route: "LivenessIntro",
  },
  {
    key: "passport",
    stepTier: 1 as VerificationTier,
    title: "Citizen Verification",
    description: "Verify your citizenship using a valid passport.",
    icon: "passport",
    lockedBy: "Human Verification",
    route: "PassportIntro",
  },
  {
    key: "residence",
    stepTier: 2 as VerificationTier,
    title: "Location Verification",
    description: "Confirm your local residency with a network check.",
    icon: "home-map-marker",
    lockedBy: "Citizen Verification",
    route: "ResidenceIntro",
  },
];

export default function VerificationHomeScreen({ navigation }: any) {
  const theme = useTheme();
  const { data, loading, reload } = useVerificationSummary();

  useFocusEffect(useCallback(() => { reload(); }, []));

  if (loading) {
    return (
      <Screen scroll title="Verification">
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  const userTier = (data?.currentTier ?? 0) as VerificationTier;
  const completedSteps = Math.min(userTier, 3);

  return (
    <Screen scroll title="Verification" subtitle="Complete steps to unlock more features.">

      {/* Summary card */}
      <TierAccessCard tier={userTier} expiresAt={data?.expiresAt ?? null} />

      {/* Steps section header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
          VERIFICATION STEPS
        </Text>
        <Text variant="labelSmall" style={{ color: VERIFICATION_TIERS[userTier].color, fontWeight: "700" }}>
          {completedSteps} of 3 complete
        </Text>
      </View>

      {/* Step cards */}
      <View style={styles.stepsContainer}>
        {STEP_META.map((step, index) => {
          const status = resolveVerificationStatus(userTier, step.stepTier);
          const tierColor = VERIFICATION_TIERS[(index + 1) as VerificationTier].color;
          const isLast = index === STEP_META.length - 1;

          return (
            <View key={step.key}>
              <TouchableOpacity
                activeOpacity={status === "available" ? 0.85 : 1}
                onPress={() => {
                  if (status === "available") navigation.navigate(step.route);
                }}
                disabled={status !== "available"}
              >
                <View
                  style={[
                    styles.stepCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor:
                        status === "completed" ? tierColor + "35" :
                        status === "available" ? tierColor + "60" :
                        theme.colors.outline + "20",
                      opacity: status === "locked" ? 0.5 : 1,
                    },
                  ]}
                >
                  {/* Step header row */}
                  <View style={styles.stepHeader}>
                    {/* Numbered circle */}
                    <View
                      style={[
                        styles.stepNumber,
                        {
                          backgroundColor:
                            status === "completed" ? tierColor :
                            status === "available" ? tierColor + "18" :
                            theme.colors.outline + "20",
                          borderColor:
                            status === "available" ? tierColor : "transparent",
                          borderWidth: status === "available" ? 2 : 0,
                        },
                      ]}
                    >
                      {status === "completed" ? (
                        <MaterialCommunityIcons name="check" size={16} color="#fff" />
                      ) : (
                        <MaterialCommunityIcons
                          name={status === "locked" ? "lock-outline" : step.icon}
                          size={15}
                          color={status === "available" ? tierColor : theme.colors.onSurfaceVariant}
                        />
                      )}
                    </View>

                    {/* Title + unlock label */}
                    <View style={{ flex: 1 }}>
                      <Text
                        variant="titleSmall"
                        style={{ fontWeight: "700", color: theme.colors.onSurface }}
                      >
                        {step.title}
                      </Text>
                      <Text
                        variant="labelSmall"
                        style={{
                          color: status === "locked" ? theme.colors.onSurfaceVariant : tierColor,
                          opacity: status === "locked" ? 0.5 : 1,
                          marginTop: 1,
                        }}
                      >
                        {status === "completed"
                          ? `Unlocked ${VERIFICATION_TIERS[(index + 1) as VerificationTier].label}`
                          : `Unlocks ${VERIFICATION_TIERS[(index + 1) as VerificationTier].label}`}
                      </Text>
                    </View>

                    {/* Status pill */}
                    {status === "completed" && (
                      <View style={[styles.pill, { backgroundColor: tierColor + "18", borderColor: tierColor + "40" }]}>
                        <MaterialCommunityIcons name="check-circle" size={11} color={tierColor} />
                        <Text variant="labelSmall" style={{ color: tierColor, fontWeight: "700" }}>Done</Text>
                      </View>
                    )}
                    {status === "available" && (
                      <View style={[styles.pill, { backgroundColor: tierColor + "18", borderColor: tierColor + "40" }]}>
                        <MaterialCommunityIcons name="star-outline" size={11} color={tierColor} />
                        <Text variant="labelSmall" style={{ color: tierColor, fontWeight: "700" }}>Up next</Text>
                      </View>
                    )}
                  </View>

                  {/* Description */}
                  <Text
                    variant="bodySmall"
                    style={[styles.stepDescription, { color: theme.colors.onSurfaceVariant }]}
                  >
                    {status === "locked" && step.lockedBy
                      ? `Complete ${step.lockedBy} first to unlock this step.`
                      : step.description}
                  </Text>

                  {/* CTA — only for active step */}
                  {status === "available" && (
                    <View style={[styles.ctaButton, { backgroundColor: tierColor }]}>
                      <Text style={styles.ctaText}>Begin</Text>
                      <MaterialCommunityIcons name="arrow-right" size={15} color="#fff" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* Connector between steps */}
              {!isLast && (
                <View style={styles.connectorWrapper}>
                  <View
                    style={[
                      styles.connector,
                      status === "completed"
                        ? { backgroundColor: VERIFICATION_TIERS[(index + 1) as VerificationTier].color + "50" }
                        : { backgroundColor: theme.colors.outline + "25" },
                    ]}
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    paddingTop: spacing.lg,
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
  },
  stepsContainer: {},
  stepCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  stepDescription: {
    lineHeight: 19,
    marginLeft: 44,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: spacing.xs,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ctaText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  connectorWrapper: {
    alignItems: "center",
    paddingLeft: spacing.md + 18, // aligns under the centre of the step number
  },
  connector: {
    width: 2,
    height: 16,
    borderRadius: 2,
  },
});
