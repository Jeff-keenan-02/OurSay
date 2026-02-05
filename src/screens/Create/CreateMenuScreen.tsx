import React from "react";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";

export default function CreateMenuScreen({ navigation }: any) {
  return (
    <Screen title="Create">
      <Section>
        <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
          Choose what you want to create.
        </Text>

        <Button
          mode="contained"
          style={{ marginBottom: 12 }}
          onPress={() => navigation.navigate("CreateDiscussion")}
        >
          Create Discussion
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate("CreatePetition")}
        >
          Create Petition
        </Button>
      </Section>
    </Screen>
  );
}