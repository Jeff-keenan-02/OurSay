import React, { useState } from "react";
import { TextInput, Button, Text } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";

export default function CreateDiscussionScreen() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const submit = () => {
    if (!title.trim() || !body.trim()) return;

    // TODO: POST /discussions
    console.log("Create discussion:", { title, body });
  };

  return (
    <Screen title="New Discussion">
      <Section>
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          style={{ marginBottom: 12 }}
        />

        <TextInput
          label="Body"
          value={body}
          onChangeText={setBody}
          multiline
          numberOfLines={5}
          style={{ marginBottom: 16 }}
        />

        <Button mode="contained" onPress={submit}>
          Publish Discussion
        </Button>
      </Section>
    </Screen>
  );
}