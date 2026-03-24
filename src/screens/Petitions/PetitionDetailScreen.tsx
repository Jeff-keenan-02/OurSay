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
  useFocusEffect,
  RouteProp,
} from "@react-navigation/native";

import { Screen } from "../../layout/Screen";
import { getProgressColor } from "../../utils/progressColor";


import { AuthContext } from "../../context/AuthContext";
import { permissions } from "../../utils/permissions";


import { usePetition } from "../../hooks/petitions/usePetition";
import { useSignPetition } from "../../hooks/petitions/useSignPetition";
import { QuerySection } from "../../components/common/QuerySection";
import { VERIFICATION_TIERS, VerificationTier } from "../../types/verification";
import { StyleSheet, View } from "react-native";
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
    <Screen showBack >
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
            This petition outlines a proposed initiative submitted to the community.
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

              <Text style={styles.metaText}>
                Verification required: {requiredTierInfo.label}
              </Text>
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

              {hasSigned && (
                <Text style={styles.successText}>
                  You have signed this petition.
                </Text>
              )}

              {!hasSigned && !canSign && (
                <Text style={styles.errorText}>
                  {requiredTierInfo.next}
                </Text>
              )}
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

  actionBlock: {
    marginTop: 8,
  },

  button: {
    marginTop: spacing.md, 
    marginBottom: 12,
  },

  successText: {
    color: "#4CAF50",
    textAlign: "center",
  },

  errorText: {
    color: "#EF5350",
    textAlign: "center",
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

});