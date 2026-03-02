import React, { useContext } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Text, useTheme, Avatar } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";
import { AuthContext } from "../../context/AuthContext";

import { VerificationTier } from "../../types/verification";
import { resolveVerificationStatus } from "../../utils/verificationProgress";

type VerificationOption = {
  key: string;
  level: VerificationTier;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  lockedMessage: string;
  onPress: () => void;
};

export default function VerificationHomeScreen({ navigation }: any) {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const userTier: VerificationTier = user?.verification_tier ?? 0;

  const options: VerificationOption[] = [
    {
      key: "liveness",
      level: 0,
      title: "Human Verification",
      description: "Confirm you are a real person using a quick liveness check.",
      icon: "account-check",
      iconColor: theme.colors.primary,
      lockedMessage: "Complete account creation first.",
      onPress: () => navigation.navigate("LivenessIntro"),
    },
    {
      key: "passport",
      level: 1,
      title: "Citizen Verification",
      description: "Verify citizenship using a valid passport.",
      icon: "passport",
      iconColor: "#FACC15",
      lockedMessage: "Complete Human Verification first.",
      onPress: () => navigation.navigate("PassportIntro"),
    },
    {
      key: "residence",
      level: 2,
      title: "Residence Verification",
      description: "Confirm your local residency.",
      icon: "home-map-marker",
      iconColor: "#38BDF8",
      lockedMessage: "Complete Citizen Verification first.",
      onPress: () => navigation.navigate("ResidenceIntro"),
    },
  ];

  return (
    <Screen
      scroll
      title="Verification"
      subtitle="Choose how you want to participate. Higher verification unlocks more civic actions."
    >
      <View style={styles.list}>
        {options.map((option) => {
          const status = resolveVerificationStatus(userTier, option.level);

          return (
            <TouchableOpacity
              key={option.key}
              activeOpacity={status === "available" ? 0.8 : 1}
              onPress={() => {

                if (status === "locked") {
                  Alert.alert("Verification Locked", option.lockedMessage);
                  return;
                }

                if (status === "completed") {
                  Alert.alert("Completed", "You have already completed this step.");
                  return;
                }

                option.onPress();
              }}
            >
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.colors.surface,
                    opacity: status === "locked" ? 0.5 : 1,
                  },
                ]}
              >
                <Avatar.Icon
                  icon={option.icon}
                  size={44}
                  style={{
                    backgroundColor: option.iconColor + "22",
                  }}
                  color={option.iconColor}
                />

                <View style={styles.textContainer}>
                  <Text variant="titleMedium">
                    {option.title}
                  </Text>

                  <Text variant="bodyMedium" style={{ opacity: 0.7 }}>
                    {option.description}
                  </Text>
                </View>

                <Text style={{ fontSize: 18 }}>
                  {status === "completed" && "✓"}
                  {status === "available" && "›"}
                  {status === "locked" && "🔒"}
                </Text>

              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 16,
    gap: spacing.md,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
});