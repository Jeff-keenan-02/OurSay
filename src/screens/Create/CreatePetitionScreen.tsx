import React, { useState } from "react";
import { TextInput, Button, Text } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";

export default function CreatePetitionScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requiredTier, setRequiredTier] = useState(2);

  const submit = () => {
    if (!title.trim() || !description.trim()) return;

    // TODO: POST /petitions
    console.log("Create petition:", {
      title,
      description,
      requiredTier,
    });
  };

  return (
    <Screen title="New Petition">
      <Section>
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          style={{ marginBottom: 12 }}
        />

        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          style={{ marginBottom: 12 }}
        />

        <Text variant="bodySmall" style={{ marginBottom: 8 }}>
          Minimum verification tier required to sign
        </Text>

        <TextInput
          value={String(requiredTier)}
          onChangeText={(v) => setRequiredTier(Number(v))}
          keyboardType="numeric"
          style={{ marginBottom: 16 }}
        />

        <Button mode="contained" onPress={submit}>
          Publish Petition
        </Button>
      </Section>
    </Screen>
  );
}