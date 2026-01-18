// screens/Verify/ResidenceCaptureScreen.tsx
import React from "react";
import { Button, Text } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";

export default function ResidenceCaptureScreen() {
  return (
    <Screen title="Proof of Residence">
      <Section>
        <Text variant="bodyMedium">
          Upload a photo or PDF of your residence document.
        </Text>

        <Button mode="contained" style={{ marginTop: 16 }}>
          Choose Document
        </Button>
      </Section>
    </Screen>
  );
}

