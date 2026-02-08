// screens/Verification/PassportIntroScreen.tsx
import React from "react";
import { Button, Text, useTheme } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { spacing } from "../../theme/spacing";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { BackRow } from "../../components/navigation/BackRow";


export default function PassportIntroScreen() {
  const theme = useTheme();
  const naigation = useNavigation<NavigationProp<any>>();


  return (
    <>
    <BackRow/>
    <Screen
      scroll
      title="Citizen Verification"
      subtitle="Verify eligibility without revealing your identity."
    >
      <Section>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          To participate in high-impact civic actions, you can verify citizenship
          using a valid passport.
        </Text>

        <Text
          variant="bodyMedium"          
          style={{
            marginTop: spacing.md,
            color: theme.colors.onSurfaceVariant,
          }}
        >
          • No passport images are stored{"\n"}
          • No face comparison is performed{"\n"}
          • Only an irreversible hash is retained
        </Text>

        <Button
          mode="contained"
          style={{ marginTop: spacing.lg }}
          onPress={() => naigation.navigate("PassportCapture")}
        >
          Continue
        </Button>
      </Section>
    </Screen>
    </>
  );
}