import React, { useContext, useCallback } from "react";
import { Text, Button, Divider, useTheme, ProgressBar } from "react-native-paper";
import { useRoute, useFocusEffect } from "@react-navigation/native";

import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { BackRow } from "../../components/common/BackRow";

import { AuthContext } from "../../context/AuthContext";
import { permissions } from "../../utils/permissions";
import {
  VerificationTier,
  VERIFICATION_TIERS,
} from "../../types/VerificationTier";

import { usePetition } from "../../hooks/petitions/usePetition";
import { useSignPetition } from "../../hooks/petitions/useSignPetition";

/* =====================================================
   Types
===================================================== */

type RouteParams = {
  petitionId: number;
};

/* =====================================================
   Screen
===================================================== */

export default function PetitionDetailScreen() {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const route = useRoute<any>();
  const { petitionId } = route.params as RouteParams;

  /* -------------------------------------------------
     Queries
  --------------------------------------------------*/

  const petitionQuery = usePetition(petitionId);

  /* -------------------------------------------------
     Mutations
  --------------------------------------------------*/

  const signMutation = useSignPetition();

  /* -------------------------------------------------
     Refresh on Focus
  --------------------------------------------------*/

  useFocusEffect(
    useCallback(() => {
      petitionQuery.reload();
    }, [petitionQuery.reload])
  );

  /* -------------------------------------------------
     Derived Values
  --------------------------------------------------*/

  const petition = petitionQuery.data;

  if (petitionQuery.loading || !petition) {
    return (
      <Screen title="Petition">
        <Text>Loading…</Text>
      </Screen>
    );
  }

  const userTier: VerificationTier =
    user?.verification_tier ?? 0;

  const requiredTier: VerificationTier =
    petition.required_verification_tier;

  const canSign = permissions.canSignPetition(
    userTier,
    requiredTier
  );

  const requiredTierInfo =
    VERIFICATION_TIERS[requiredTier];

  /* -------------------------------------------------
     Handlers
  --------------------------------------------------*/

  const handleSign = async () => {
    if (!user) return;

    const success = await signMutation.sign(
      petition.id,
      user.id
    );

    if (success) {
      petitionQuery.reload();
    }
  };

  /* -------------------------------------------------
     Render
  --------------------------------------------------*/

  return (
    <>
      <BackRow />

      <Screen title="Petition">
        <Section>

          {/* ---------- Title ---------- */}

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

          {/* ---------- Stats ---------- */}

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

          {/* ---------- Sign Button ---------- */}

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

          {/* ---------- Progress ---------- */}

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
            {petition.signatures} /{" "}
            {petition.signature_goal} signatures
          </Text>

        </Section>
      </Screen>
    </>
  );
}