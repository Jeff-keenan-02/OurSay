import React, { useContext, useCallback } from "react";
import {
  Text,
  Button,
  Divider,
  useTheme,
  ProgressBar,
} from "react-native-paper";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
  RouteProp,
} from "@react-navigation/native";

import { Screen } from "../../layout/Screen";
import { getProgressColor } from "../../utils/progressColor";
import { AccessStatusChip } from "../../components/common/AccessStatusChip";


import { AuthContext } from "../../context/AuthContext";
import { permissions } from "../../utils/permissions";


import { usePetition } from "../../hooks/petitions/usePetition";
import { useSignPetition } from "../../hooks/petitions/useSignPetition";
import { QuerySection } from "../../components/common/QuerySection";
import { VERIFICATION_TIERS, VerificationTier } from "../../types/verification";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

/* =====================================================
   Types
===================================================== */

type RouteParams = {
  PetitionDetail: {
    petitionId: number;
  };
};

/* =====================================================
   Screen
===================================================== */
export default function PetitionDetailScreen() {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const navigation = useNavigation<any>();

  const route =
    useRoute<RouteProp<RouteParams, "PetitionDetail">>();
  const { petitionId } = route.params;

  const petitionQuery = usePetition(petitionId);
  const signMutation = useSignPetition();

  useFocusEffect(
    useCallback(() => {
      petitionQuery.reload();
    }, [petitionQuery.reload])
  );

  return (
    <Screen showBack scroll >
      <QuerySection
        label="Petition"
        query={petitionQuery}>
          

        {(petition) => {
          const userTier =
            user?.verification_tier ?? 0;


        const requiredTier = petition.required_verification_tier as VerificationTier;

        const hasSigned = petition.has_signed;

        const canSign =
          permissions.canSignPetition(
            userTier,
            requiredTier
          );

        const isActionAvailable = canSign && !hasSigned;
        const requiredTierInfo = VERIFICATION_TIERS[requiredTier];

          const handleSign = async () => {
            if (!user) return;

            const success =
              await signMutation.sign(
                petition.id,
                user.id
              );

            if (success) {
              petitionQuery.reload();
            }
          };

          return (
          <>
            {/* PETITION CARD */}
          <Text
            variant="bodyMedium"
            style={styles.introText}
          >
            Review the details below and choose whether to add your support.
          </Text>

          <View style={styles.sectionDivider} />
            
            <View style={styles.petitionCard}>
              <Text variant="headlineSmall" style={styles.title}>
                {petition.title}
              </Text>

              <Text variant="bodyMedium" style={styles.description}>
                {petition.description}
              </Text>

              <View style={styles.innerDivider} />

              <ProgressBar
                progress={petition.progress}
                color={getProgressColor(petition.progress, petition.signatures >= petition.signature_goal)}
                style={styles.progress}
              />

              <Text style={styles.metaText}>
                {petition.signatures.toLocaleString()} of{" "}
                {petition.signature_goal.toLocaleString()} signatures
              </Text>

              <View style={styles.cardFooterRow}>
                <AccessStatusChip variant="tier" requiredTier={requiredTier} />
                <AccessStatusChip variant={hasSigned ? "signed" : "unsigned"} />
              </View>
            </View>

            {/* ACTION AREA */}
            <View style={styles.fixedAction}>
              <Button
                mode="contained"
                disabled={!isActionAvailable || signMutation.loading}
                loading={signMutation.loading}
                onPress={handleSign}
                style={styles.button}
              >
                {hasSigned
                  ? "Signed"
                  : canSign
                  ? "Sign Petition"
                  : `Requires ${requiredTierInfo.label}`}
              </Button>

              {!hasSigned && !canSign && (
                <AccessStatusChip variant="locked" requiredTier={requiredTier} />
              )}

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("PetitionAnalyticsDetail", {
                    petitionId: petition.id,
                    title: petition.title,
                  })
                }
                activeOpacity={0.7}
                style={styles.analyticsButton}
              >
                <MaterialCommunityIcons
                  name="chart-bar"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text style={[styles.analyticsButtonText, { color: theme.colors.primary }]}>
                  View Analytics
                </Text>
              </TouchableOpacity>
            </View>

          </>
          );
        }}
      </QuerySection>
    </Screen>
  );
}
const styles = StyleSheet.create({
petitionCard: {
  backgroundColor: "rgba(255,255,255,0.04)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.06)",
  padding: 20,
  borderRadius: 16,
  marginBottom: 20,
},
  title: {
    marginBottom: 12,
    fontWeight: "600",
  },

  description: {
    marginBottom: 20,
    opacity: 0.85,
    lineHeight: 22,
  },

  innerDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 20,
  },

  progress: {
    height: 6,
    borderRadius: 4,
    marginBottom: 12,
  },

  metaText: {
    opacity: 0.7,
    marginBottom: 4,
  },
  cardFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },

  actionBlock: {
    marginTop: 8,
  },

  button: {
    marginTop: spacing.md, 
    marginBottom: 12,
  },

  fixedAction: {
  padding: 16,
  borderTopWidth: StyleSheet.hairlineWidth,
  borderTopColor: "rgba(255,255,255,0.08)",
},
introText: {
  opacity: 0.75,
  lineHeight: 20,
  marginBottom: 12,
},

sectionDivider: {
  height: StyleSheet.hairlineWidth,
  backgroundColor: "rgba(255,255,255,0.08)",
  marginBottom: spacing.lg,
},
analyticsButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xs,
  marginTop: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "rgba(128,128,128,0.2)",
},
analyticsButtonText: {
  fontSize: 14,
  fontWeight: "600",
},
});