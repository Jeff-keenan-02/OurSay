import React, { useContext, useEffect, useState } from "react";
import { Text, Button, Divider, useTheme } from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { AuthContext } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config/api";

export default function PetitionDetailScreen() {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const route = useRoute<any>();
  const { petitionId } = route.params;

  const [petition, setPetition] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/petitions/${petitionId}`)
      .then((res) => res.json())
      .then(setPetition);
  }, [petitionId]);

  if (!petition) {
    return <Screen title="Petition"><Text>Loading…</Text></Screen>;
  }

  const userTier = user?.verification_level ?? 0;
  const canSign = userTier >= petition.required_verification_level;

  const signPetition = async () => {
    await fetch(`${API_BASE_URL}/petitions/${petitionId}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.id }),
    });
  };

  return (
    <Screen title="Petition">
      <Section>
        <Text variant="headlineSmall">{petition.title}</Text>

        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant, marginVertical: 16 }}
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
          Requires Tier {petition.required_verification_level}
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
          <Text style={{ color: theme.colors.error, marginTop: 8 }}>
            Complete verification to sign this petition.
          </Text>
        )}
      </Section>
    </Screen>
  );
}