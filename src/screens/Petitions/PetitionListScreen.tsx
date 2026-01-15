import React from "react";
import { FlatList, View } from "react-native";
import { Text, useTheme, Button, Divider } from "react-native-paper";

import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";

const MOCK_PETITIONS = [
  {
    id: 1,
    title: "Improve Public Transport Funding",
    description: "Increase funding for regional bus and rail services.",
    signatures: 1243,
  },
  {
    id: 2,
    title: "Lower Student Accommodation Costs",
    description: "Introduce rent caps for purpose-built student housing.",
    signatures: 2874,
  },
  {
    id: 3,
    title: "Expand Mental Health Services",
    description: "Increase access to publicly funded mental health care.",
    signatures: 4120,
  },
];

export default function PetitionListScreen() {
  const theme = useTheme();

  return (
    <Screen
      scroll
      title="Petitions"
      subtitle="Support public petitions raised by the community"
    >
      <Section label="Active Petitions">
        <FlatList
          data={MOCK_PETITIONS}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({ item }) => (
            <View style={{ paddingVertical: 12 }}>
              <Text variant="titleMedium">
                {item.title}
              </Text>

              <Text
                variant="bodyMedium"
                style={[
                  { color: theme.colors.onSurfaceVariant, marginVertical: 4 },
                ]}
              >
                {item.description}
              </Text>

              <Text
                    variant="bodyMedium"
                style={[
                  { color: theme.colors.primary },
                ]}
              >
                {item.signatures.toLocaleString()} signatures
              </Text>

              <Button
                mode="outlined"
                style={{ marginTop: 8, alignSelf: "flex-start" }}
              >
                View Petition
              </Button>
            </View>
          )}
        />
      </Section>
    </Screen>
  );
}