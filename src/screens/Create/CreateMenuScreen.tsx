import React, { useContext } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";
import { AuthContext } from "../../context/AuthContext";
import { VerificationTier } from "../../types/verification";
import { VERIFICATION_TIERS } from "../../types/verification";

const DISCUSSION_COLOR = "#6366f1";
const PETITION_COLOR   = "#f59e0b";

type CreateOption = {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  requiredTier: VerificationTier;
  tierLabel: string;
  bullets: string[];
  onPress: () => void;
};

function CreateCard({
  option,
  isLocked,
}: {
  option: CreateOption;
  isLocked: boolean;
}) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={isLocked ? 1 : 0.85}
      onPress={isLocked ? undefined : option.onPress}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            opacity: isLocked ? 0.55 : 1,
          },
        ]}
      >
        {/* Coloured top strip */}
        <View style={[styles.strip, { backgroundColor: option.color }]} />

        <View style={styles.cardBody}>
          {/* Header row */}
          <View style={styles.headerRow}>
            <View style={[styles.iconBox, { backgroundColor: option.color + "22" }]}>
              <MaterialCommunityIcons
                name={option.icon}
                size={28}
                color={option.color}
              />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.cardTitle, { color: option.color }]}>
                {option.title}
              </Text>
              <Text style={[styles.cardSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                {option.subtitle}
              </Text>
            </View>
            <MaterialCommunityIcons
              name={isLocked ? "lock-outline" : "chevron-right"}
              size={22}
              color={isLocked ? theme.colors.onSurfaceVariant : option.color}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: option.color + "30" }]} />

          {/* Bullet features */}
          <View style={styles.bullets}>
            {option.bullets.map((b, i) => (
              <View key={i} style={styles.bulletRow}>
                <MaterialCommunityIcons name="check-circle-outline" size={15} color={option.color} />
                <Text style={[styles.bulletText, { color: theme.colors.onSurface }]}>{b}</Text>
              </View>
            ))}
          </View>

          {/* Tier requirement */}
          <View style={[styles.tierPill, { backgroundColor: option.color + "18" }]}>
            <MaterialCommunityIcons
              name={VERIFICATION_TIERS[option.requiredTier].icon}
              size={14}
              color={option.color}
            />
            <Text style={[styles.tierText, { color: option.color }]}>
              {`Requires ${option.tierLabel}`}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CreateMenuScreen({ navigation }: any) {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const userTier: VerificationTier = user?.verification_tier ?? 0;

  const options: CreateOption[] = [
    {
      key: "discussion",
      title: "Start a Discussion",
      subtitle: "Open a public conversation",
      icon: "forum-outline",
      color: DISCUSSION_COLOR,
      requiredTier: 1,
      tierLabel: "Tier 1 — Human Verification",
      bullets: [
        "Share your perspective with the community",
        "Invite replies and open debate",
        "Upvote the most popular views",
      ],
      onPress: () => navigation.navigate("CreateDiscussion"),
    },
    {
      key: "petition",
      title: "Launch a Petition",
      subtitle: "Rally verified public support",
      icon: "file-sign",
      color: PETITION_COLOR,
      requiredTier: 2,
      tierLabel: "Tier 2 — Citizen Verification",
      bullets: [
        "Set a signature goal for local, regional, or national reach",
        "Only verified citizens can sign",
        "Track progress in real time",
      ],
      onPress: () => navigation.navigate("CreatePetition"),
    },
  ];

  return (
    <Screen title="Create" scroll>
      <Text style={[styles.pageSubtitle, { color: theme.colors.onSurfaceVariant }]}>
        Use your voice. Higher verification unlocks more powerful tools.
      </Text>

      <View style={styles.list}>
        {options.map((option) => (
          <CreateCard
            key={option.key}
            option={option}
            isLocked={userTier < option.requiredTier}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.lg,
    opacity: 0.8,
  },
  list: {
    gap: spacing.lg,
  },
  card: {
    borderRadius: 18,
    overflow: "hidden",
  },
  strip: {
    height: 5,
  },
  cardBody: {
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 2,
    opacity: 0.8,
  },
  divider: {
    height: 1,
    marginBottom: spacing.md,
  },
  bullets: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  bulletText: {
    fontSize: 13,
    flex: 1,
  },
  tierPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: spacing.xs,
  },
  tierText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
