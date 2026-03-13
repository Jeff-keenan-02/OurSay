import React, { useState } from "react";
import { TextInput, Button, Text } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { spacing } from "../../theme/spacing";
import {
  Keyboard,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useCreateDiscussion } from "../../hooks/discussions/useCreateDiscussion";

export default function CreateDiscussionScreen({ navigation }: any) {
  const { createDiscussion, loading } = useCreateDiscussion();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const submit = async () => {
    if (!title.trim() || !body.trim()) return;

    try {
      const data = await createDiscussion(title.trim(), body.trim());

      navigation.navigate("Discussions", {
        screen: "DiscussionDetail",
        params: { id: data.id },
      });
    } catch (err: any) {
      console.error("Create failed:", err.message);
    }
  };

  return (
    <Screen title="New Discussion" scroll showBack>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.container} onPress={Keyboard.dismiss}>
          <Section>

            {/* Intro */}
            <Text style={styles.introText}>
              Start a new community discussion. Share your thoughts and invite
              others to contribute respectfully.
            </Text>

            <View style={styles.sectionDivider} />

            {/* Title Group */}
            <View style={styles.group}>
              <Text style={styles.label}>DISCUSSION TITLE</Text>
              <Text style={styles.helperDescription}>
                A short and clear headline for your topic.
              </Text>

              <TextInput
                label="Title"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
              />
            </View>

            {/* Body Group */}
            <View style={styles.group}>
              <Text style={styles.label}>DETAILS</Text>
              <Text style={styles.helperDescription}>
                Provide context or background to help others understand your
                discussion.
              </Text>

              <TextInput
                label="Body"
                value={body}
                onChangeText={setBody}
                multiline
                numberOfLines={6}
              />
            </View>

            <Button
              mode="contained"
              style={styles.button}
              onPress={() => {
                Keyboard.dismiss();
                submit();
              }}
              loading={loading}
              disabled={loading}
            >
              Publish Discussion
            </Button>

          </Section>
        </Pressable>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  introText: {
    opacity: 0.75,
    lineHeight: 20,
    marginBottom: spacing.md,
  },

  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: spacing.lg,
  },

  group: {
    marginBottom: spacing.lg,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    opacity: 0.75,
    marginBottom: spacing.xs,
  },

  helperDescription: {
    opacity: 0.6,
    fontSize: 13,
    marginBottom: spacing.md,
  },

  input: {
    marginBottom: spacing.md,
  },

  button: {
    marginTop: spacing.xl,
  },
});