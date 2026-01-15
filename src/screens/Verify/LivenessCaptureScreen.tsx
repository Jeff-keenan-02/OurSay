// screens/Verify/LivenessCaptureScreen.tsx
import React from "react";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";

export default function LivenessCaptureScreen() {
  return (
    <Screen title="Liveness Check">
      <Section>
        <Text variant="bodyMedium">
          Camera capture / video recording goes here.
        </Text>

        <ActivityIndicator style={{ marginVertical: 20 }} />

        <Button mode="contained">Complete Liveness Check</Button>
      </Section>
    </Screen>
  );
}