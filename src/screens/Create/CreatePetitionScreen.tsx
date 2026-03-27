import React, { useState } from "react";
import { TextInput, Button, Text, SegmentedButtons, useTheme } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { useApiClient } from "../../hooks/common/useApiClient";
import { StyleSheet } from "react-native";
import { spacing } from "../../theme/spacing";
import {
  Keyboard,
  View,
  Pressable,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const PETITION_COLOR = "#f59e0b";

const GOAL_MAP: Record<"local" | "regional" | "national", number> = {
  local: 100,
  regional: 1000,
  national: 10000,
};

export default function CreatePetitionScreen({ navigation }: any) {
  const theme = useTheme();
  const api = useApiClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [requiredTier, setRequiredTier] = useState<2 | 3>(2);
  const [goalTier, setGoalTier] = useState<"local" | "regional" | "national">("local");

  const submit = async () => {
    if (!title.trim() || !description.trim()) return;

    try {
      setLoading(true);

      const data = await api.post<{ id: number }>("/petitions", {
        title: title.trim(),
        description: description.trim(),
        required_verification_tier: requiredTier,
        signature_goal: GOAL_MAP[goalTier],
      });

      navigation.navigate("Petitions", {
        screen: "PetitionDetail",
        params: { petitionId: data.id },
      });
    } catch (err: any) {
      console.error("Create petition failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="New Petition" scroll showBack>
      <Pressable onPress={Keyboard.dismiss}>

          {/* Coloured hero banner */}
          <View style={[styles.heroBanner, { backgroundColor: PETITION_COLOR + "18", borderColor: PETITION_COLOR + "40" }]}>
            <View style={[styles.heroIconBox, { backgroundColor: PETITION_COLOR + "25" }]}>
              <MaterialCommunityIcons name="file-sign" size={30} color={PETITION_COLOR} />
            </View>
            <View style={styles.heroText}>
              <Text style={[styles.heroTitle, { color: PETITION_COLOR }]}>Launch a Petition</Text>
              <Text style={[styles.heroSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Set a goal, require verified support, and drive real civic action.
              </Text>
            </View>
          </View>

          <Section>

            {/* Title & Description */}
            <View style={styles.group}>
              <Text style={[styles.label, { color: PETITION_COLOR }]}>PETITION DETAILS</Text>
              <Text style={styles.helperDescription}>
                Give your petition a clear title and explain what you want to achieve.
              </Text>

              <TextInput
                label="Petition Title"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
              />

              <TextInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
              />
            </View>

            {/* Verification Required */}
            <View style={styles.group}>
              <Text style={[styles.label, { color: PETITION_COLOR }]}>VERIFICATION REQUIRED</Text>
              <Text style={styles.helperDescription}>
                Minimum identity level required to sign this petition.
              </Text>

              <SegmentedButtons
                value={requiredTier.toString()}
                onValueChange={(value) => setRequiredTier(Number(value) as 2 | 3)}
                buttons={[
                  { value: "2", label: "Tier 2 (Passport)" },
                  { value: "3", label: "Tier 3 (Full)" },
                ]}
                style={styles.segmented}
              />
            </View>

            {/* Signature Goal */}
            <View style={styles.group}>
              <Text style={[styles.label, { color: PETITION_COLOR }]}>SIGNATURE GOAL</Text>
              <Text style={styles.helperDescription}>
                How many verified supporters does this petition need to succeed?
              </Text>

              <SegmentedButtons
                value={goalTier}
                onValueChange={(value) => setGoalTier(value as "local" | "regional" | "national")}
                buttons={[
                  { value: "local", label: "Local" },
                  { value: "regional", label: "Regional" },
                  { value: "national", label: "National" },
                ]}
              />

              <Text variant="bodySmall" style={styles.helperText}>
                Local (100)  •  Regional (1,000)  •  National (10,000)
              </Text>
            </View>

            <Button
              mode="contained"
              buttonColor={PETITION_COLOR}
              textColor="#000"
              style={styles.button}
              onPress={() => {
                Keyboard.dismiss();
                submit();
              }}
              loading={loading}
              disabled={loading}
            >
              Publish Petition
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
  segmented: {
    marginBottom: spacing.md,
  },
  helperText: {
    opacity: 0.55,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  button: {
    marginTop: spacing.xl,
  },
});
