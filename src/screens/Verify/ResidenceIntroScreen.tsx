// screens/Verify/ResidenceIntroScreen.tsx
import React from "react";
import { Button, Text, Card, useTheme } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { useNavigation } from "@react-navigation/native";
import { BackRow } from "../../components/navigation/BackRow";

export default function ResidenceIntroScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();

  return (
    <>
    <BackRow/>
    <Screen title="Proof of Residence" subtitle="Confirm where you live">
      <Section>
        <Card style={{ backgroundColor: theme.colors.surface }}>
          <Card.Content>
            <Text variant="titleMedium">Accepted documents</Text>
            <Text variant="bodyMedium">
              Utility bill, government letter, or bank statement issued within
              the last 3 months.
            </Text>

            <Button
              mode="contained"
              style={{ marginTop: 16 }}
              onPress={() => navigation.navigate("ResidenceCapture")}
            >
              Upload Document
            </Button>
          </Card.Content>
        </Card>
      </Section>
    </Screen>
    </>
  );
}