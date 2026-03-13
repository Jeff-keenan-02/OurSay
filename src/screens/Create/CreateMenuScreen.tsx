import React, { useContext } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Text, useTheme, Avatar } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";
import { AuthContext } from "../../context/AuthContext";
import { VerificationTier } from "../../types/verification";

type CreateOption = {
  key: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  requiredTier: VerificationTier;
  lockedMessage: string;
  onPress: () => void;
};

export default function CreateMenuScreen({ navigation }: any) {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const userTier: VerificationTier = user?.verification_tier ?? 0;

  const options: CreateOption[] = [
    {
      key: "discussion",
      title: "Create Discussion",
      description:
        "Start a public conversation and invite the community to share opinions.",
      icon: "forum",
      iconColor: theme.colors.primary,
      requiredTier: 1,
      lockedMessage: "You must complete Human Verification first.",
      onPress: () => navigation.navigate("CreateDiscussion"),
    },
    {
      key: "petition",
      title: "Create Petition",
      description:
        "Propose a civic initiative and gather verified public support.",
      icon: "file-document-edit",
      iconColor: "#38BDF8",
      requiredTier: 2,
      lockedMessage: "Citizen Verification required to create petitions.",
      onPress: () => navigation.navigate("CreatePetition"),
    },
  ];

  return (
    <Screen
      scroll
      title="Create"
      subtitle="Initiate civic action. Higher verification levels unlock more powerful tools."
    >
      <View style={styles.list}>
        {options.map((option) => {
          const isLocked = userTier < option.requiredTier;

          return (
            <TouchableOpacity
              key={option.key}
              activeOpacity={isLocked ? 1 : 0.8}
              onPress={() => {
                if (isLocked) {
                  Alert.alert("Verification Required", option.lockedMessage);
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
                    opacity: isLocked ? 0.5 : 1,
                  },
                ]}
              >
                <Avatar.Icon
                  icon={option.icon}
                  size={52}
                  style={{
                    backgroundColor: option.iconColor + "22",
                  }}
                  color={option.iconColor}
                />

                <View style={styles.textContainer}>
                  <Text variant="titleMedium">
                    {option.title}
                  </Text>

                  <Text
                    variant="bodyMedium"
                    style={{ opacity: 0.7 }}
                  >
                    {option.description}
                  </Text>
                </View>

                <Text style={{ fontSize: 18 }}>
                  {isLocked ? "🔒" : "›"}
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
    flex: 1,
    justifyContent: "center",
    gap: spacing.lg,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: 18,
    gap: spacing.md,
    minHeight: 1, 
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
});