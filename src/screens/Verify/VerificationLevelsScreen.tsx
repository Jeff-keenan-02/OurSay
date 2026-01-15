import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme, Avatar } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";

type VerificationOption = {
  key: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  onPress: () => void;
};

export default function VerificationLevelsScreen({ navigation }: any) {
  const theme = useTheme();

  const options: VerificationOption[] = [
    {
      key: "liveness",
      title: "Human Verification",
      description: "Confirm you are a real person using a quick liveness check.",
      icon: "account-check",
      iconColor: theme.colors.primary,
      onPress: () => navigation.navigate("LivenessIntro"),
    },
    {
      key: "passport",
      title: "Citizen Verification",
      description: "Verify citizenship using a valid passport. No identity is stored.",
      icon: "passport",
      iconColor: "#FACC15", // soft amber
      onPress: () => navigation.navigate("PassportIntro"),
    },
    {
      key: "residence",
      title: "Residence Verification",
      description: "Confirm your local residency for region-specific participation.",
      icon: "home-map-marker",
      iconColor: "#38BDF8", // sky blue
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
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            activeOpacity={0.8}
            onPress={option.onPress}
          >
            <View
              style={[
                styles.card,
                { backgroundColor: theme.colors.surface },
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
                <Text
                  variant="titleMedium"
                  style={{ color: theme.colors.onSurface }}
                >
                  {option.title}
                </Text>

                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {option.description}
                </Text>
              </View>

              <Text
                style={{
                  color: theme.colors.onSurfaceVariant,
                  fontSize: 18,
                }}
              >
                ›
              </Text>
            </View>
          </TouchableOpacity>
        ))}
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