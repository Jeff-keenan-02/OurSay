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


import { AuthContext } from "../../context/AuthContext";
import { permissions } from "../../utils/permissions";
import {
  VerificationTier,
  VERIFICATION_TIERS,
} from "../../types/VerificationTier";

import { usePetition } from "../../hooks/petitions/usePetition";
import { useSignPetition } from "../../hooks/petitions/useSignPetition";
import { QuerySection } from "../../components/common/QuerySection";

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
    <Screen title="Petition" showBack>
      <QuerySection
        label="Petition"
        query={petitionQuery}
      >
        {(petition) => {
          const userTier =
            user?.verification_tier ?? 0;

          const requiredTier =
            petition.required_verification_tier;

          const canSign =
            permissions.canSignPetition(
              userTier,
              requiredTier
            );

          const requiredTierInfo =
            VERIFICATION_TIERS[requiredTier];

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
              <Text variant="headlineSmall">
                {petition.title}
              </Text>

              <Text
                variant="bodyMedium"
                style={{
                  color: theme.colors.onSurfaceVariant,
                  marginVertical: 16,
                }}
              >
                {petition.description}
              </Text>

              <Divider />

              <Text variant="titleMedium">
                {petition.signatures} signatures
              </Text>

              <Text
                variant="bodySmall"
                style={{
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                Requires {requiredTierInfo.label}
              </Text>

              <Button
                mode="contained"
                disabled={!canSign}
                loading={signMutation.loading}
                onPress={handleSign}
                style={{ marginTop: 16 }}
              >
                Sign Petition
              </Button>

              {!canSign && (
                <Text
                  variant="bodySmall"
                  style={{
                    color: theme.colors.error,
                    marginTop: 8,
                  }}
                >
                  {requiredTierInfo.next}
                </Text>
              )}

              <ProgressBar
                progress={petition.progress}
                color={theme.colors.primary}
                style={{
                  height: 8,
                  borderRadius: 6,
                  marginVertical: 12,
                }}
              />

              <Text variant="bodySmall">
                {petition.signatures} / {petition.signature_goal} signatures
              </Text>
            </>
          );
        }}
      </QuerySection>
    </Screen>
  );
}