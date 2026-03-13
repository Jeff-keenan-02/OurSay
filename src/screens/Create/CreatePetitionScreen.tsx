import React, { useState } from "react";
import { TextInput, Button, Text } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { useApiClient } from "../../hooks/common/useApiClient";
import { StyleSheet } from "react-native";
import { spacing } from "../../theme/spacing";


import {
  Keyboard,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SegmentedButtons } from "react-native-paper";


export default function CreatePetitionScreen({ navigation }: any) {
  const api = useApiClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // required level to support petition 
  const [requiredTier, setRequiredTier] = useState<2 | 3>(2);
  //goal of the petition in terms of number of supporters
  const GOAL_MAP: Record<"local" | "regional" | "national", number> = {
  local: 100,
  regional: 1000,
  national: 10000,
};
  const [goalTier, setGoalTier] = useState<"local" | "regional" | "national">("local");

  const submit = async () => {
    if (!title.trim() || !description.trim()) return;

    try {
      setLoading(true);

      // Endpoint not implemented yet
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
  <KeyboardAvoidingView
    style={styles.container}
    behavior={Platform.OS === "ios" ? "padding" : undefined}
  >
    <Pressable style={styles.container} onPress={Keyboard.dismiss}>
      <Section>

        {/* Title & Description Group */}
        <View style={styles.group}>
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

        {/* Verification Group */}
        <View style={styles.group}>
          <Text style={styles.label}>
            VERIFICATION REQUIRED
          </Text>

          <Text style={styles.helperDescription}>
            Minimum identity level required to support this petition.
          </Text>

          <SegmentedButtons
            value={requiredTier.toString()}
            onValueChange={(value) =>
              setRequiredTier(Number(value) as 2 | 3)
            }
            buttons={[
              { value: "2", label: "Tier 2 (Passport)" },
              { value: "3", label: "Tier 3 (Full Verification)" },
            ]}
            style={styles.segmented}
          />
        </View>

        {/* Goal Group */}
        <View style={styles.group}>
          <Text style={styles.label}>
            SIGNATURE GOAL
          </Text>

          <Text style={styles.helperDescription}>
            The number of verified supporters needed for this petition to succeed.
          </Text>

          <SegmentedButtons
            value={goalTier}
            onValueChange={(value) =>
              setGoalTier(value as "local" | "regional" | "national")
            }
            buttons={[
              { value: "local", label: "Local" },
              { value: "regional", label: "Regional" },
              { value: "national", label: "National" },
            ]}
          />

          <Text variant="bodySmall" style={styles.helperText}>
            Local (100) • Regional (1,000) • National (10,000)
          </Text>
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
          Publish Petition
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
    marginBottom: spacing.xs,
  },
  helperDescription: {
  opacity: 0.6,
  fontSize: 13,
  marginBottom: spacing.md,
},

  button: {
    marginTop: spacing.xl,
  },
  
});