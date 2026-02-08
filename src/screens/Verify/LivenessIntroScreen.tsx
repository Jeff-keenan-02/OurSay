// screens/Verify/LivenessIntroScreen.tsx
import React from "react";
import { Button, Text, Card, useTheme } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { useNavigation } from "@react-navigation/native";
import { BackRow } from "../../components/navigation/BackRow";

export default function LivenessIntroScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();

  return (
    <>
    <BackRow/>
    <Screen title="Liveness Check" subtitle="Confirm you're a real person">
      <Section>
        <Card style={{ backgroundColor: theme.colors.surface }}>
          <Card.Content>
            <Text variant="titleMedium">What is a liveness check?</Text>
            <Text variant="bodyMedium">
              You'll be asked to take a short selfie video to confirm you're a
              real person and not a photo or recording.
            </Text>

            <Button
              mode="contained"
              style={{ marginTop: 16 }}
              onPress={() => navigation.navigate("LivenessCapture")}
            >
              Start Liveness Check
            </Button>
          </Card.Content>
        </Card>
      </Section>
    </Screen>
    </>
  );
}