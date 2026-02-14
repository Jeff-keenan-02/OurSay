import React, { useContext, useEffect, useState } from "react";
import { Text, Button, Divider, useTheme, ProgressBar } from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { AuthContext } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config/api";
import { permissions } from "../../utils/permissions";
import {
  VerificationTier,
  VERIFICATION_TIERS,
} from "../../types/VerificationTier";
import { Petition } from "../../types/Petition";
import { BackRow } from "../../components/common/BackRow";

export default function PetitionDetailScreen() {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const route = useRoute<any>();
  const { petitionId } = route.params;

  const [petition, setPetition] = useState<Petition | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/petitions/${petitionId}`)
      .then((res) => res.json())
      .then(setPetition);
  }, [petitionId]);

  if (!petition) {
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

  const requiredTierInfo = VERIFICATION_TIERS[requiredTier];

  const signPetition = async () => {
    await fetch(`${API_BASE_URL}/petitions/${petitionId}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.id }),
    });
  const res = await fetch(`${API_BASE_URL}/petitions/${petitionId}`);
  const updated = await res.json();
  setPetition(updated);
  };

  return (
    <>
    <BackRow/>
    
    <Screen title="Petition">
      <Section>
        <Text variant="headlineSmall">{petition.title}</Text>

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
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Requires {requiredTierInfo.label}
        </Text>

        <Button
          mode="contained"
          disabled={!canSign}
          onPress={signPetition}
          style={{ marginTop: 16 }}
        >
          Sign Petition
        </Button>

        {!canSign && (
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.error, marginTop: 8 }}
          >
            {requiredTierInfo.next}
          </Text>
        )}
        <ProgressBar
          progress={petition.progress}
          color={theme.colors.primary}
          style={{ height: 8, borderRadius: 6, marginVertical: 12 }}
        />

        <Text variant="bodySmall">
          {petition.signatures} / {petition.signature_goal} signatures
        </Text>
      </Section>
    </Screen>
    </>
  );
}