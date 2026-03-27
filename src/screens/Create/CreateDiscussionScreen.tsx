import React, { useState } from "react";
import { TextInput, Button, Text, useTheme } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { spacing } from "../../theme/spacing";
import {
  Keyboard,
  View,
  Pressable,
  StyleSheet,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useCreateDiscussion } from "../../hooks/discussions/useCreateDiscussion";

const DISCUSSION_COLOR = "#6366f1";

export default function CreateDiscussionScreen({ navigation }: any) {
  const theme = useTheme();
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
      <Pressable onPress={Keyboard.dismiss}>

          {/* Coloured hero banner */}
          <View style={[styles.heroBanner, { backgroundColor: DISCUSSION_COLOR + "18", borderColor: DISCUSSION_COLOR + "40" }]}>
            <View style={[styles.heroIconBox, { backgroundColor: DISCUSSION_COLOR + "25" }]}>
              <MaterialCommunityIcons name="forum-outline" size={30} color={DISCUSSION_COLOR} />
            </View>
            <View style={styles.heroText}>
              <Text style={[styles.heroTitle, { color: DISCUSSION_COLOR }]}>Start a Discussion</Text>
              <Text style={[styles.heroSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Share your perspective and invite the community to respond.
              </Text>
            </View>
          </View>

          <Section>

            {/* Title Group */}
            <View style={styles.group}>
              <Text style={[styles.label, { color: DISCUSSION_COLOR }]}>DISCUSSION TITLE</Text>
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
              <Text style={[styles.label, { color: DISCUSSION_COLOR }]}>DETAILS</Text>
              <Text style={styles.helperDescription}>
                Provide context or background to help others understand your discussion.
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
              buttonColor={DISCUSSION_COLOR}
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  heroIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.85,
  },
  group: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
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
