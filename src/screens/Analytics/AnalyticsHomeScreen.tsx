import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";

const POLL_COLOR     = "#0ea5e9";
const PETITION_COLOR = "#f59e0b";

const POLL_STATS = [
  { icon: "help-circle-outline", label: "Questions per group" },
  { icon: "account-multiple-outline", label: "Anonymous participants" },
  { icon: "chart-bar", label: "Yes / No breakdowns" },
];

const PETITION_STATS = [
  { icon: "draw-pen", label: "Signature counts" },
  { icon: "flag-outline", label: "Goal progress" },
  { icon: "trending-up", label: "Support over time" },
];

function HeroCard({
  color,
  icon,
  title,
  subtitle,
  bullets,
  onPress,
}: {
  color: string;
  icon: string;
  title: string;
  subtitle: string;
  bullets: { icon: string; label: string }[];
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: color + "40" }]}>
        {/* Top accent strip */}
        <View style={[styles.cardStrip, { backgroundColor: color }]} />

        <View style={styles.cardContent}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: color + "22" }]}>
              <MaterialCommunityIcons name={icon} size={28} color={color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                {title}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, opacity: 0.8 }}>
                {subtitle}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={color} />
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: color + "25" }]} />

          {/* Bullet features */}
          <View style={styles.bullets}>
            {bullets.map((b, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={[styles.bulletDot, { backgroundColor: color + "30" }]}>
                  <MaterialCommunityIcons name={b.icon} size={14} color={color} />
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {b.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function AnalyticsHomeScreen({ navigation }: any) {
  const theme = useTheme();

  return (
    <Screen scroll title="Analytics" subtitle="Explore anonymous voting and petition data.">
      {/* Intro banner */}
      <View style={[styles.banner, { backgroundColor: theme.colors.surface }]}>
        <MaterialCommunityIcons name="shield-lock-outline" size={18} color={theme.colors.onSurfaceVariant} />
        <Text variant="bodySmall" style={[styles.bannerText, { color: theme.colors.onSurfaceVariant }]}>
          All results are anonymous. Individual votes and signatures are never shown.
        </Text>
      </View>

      <View style={styles.container}>
        <HeroCard
          color={POLL_COLOR}
          icon="chart-bar"
          title="Poll Analytics"
          subtitle="Aggregated voting results grouped by topic"
          bullets={POLL_STATS}
          onPress={() => navigation.navigate("PollAnalyticsList")}
        />

        <HeroCard
          color={PETITION_COLOR}
          icon="file-sign"
          title="Petition Analytics"
          subtitle="Signature progress and goal tracking by topic"
          bullets={PETITION_STATS}
          onPress={() => navigation.navigate("PetitionAnalyticsList")}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  bannerText: {
    flex: 1,
    lineHeight: 18,
    opacity: 0.7,
  },
  container: {
    gap: spacing.lg,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardStrip: {
    height: 4,
    width: "100%",
  },
  cardContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontWeight: "700",
    marginBottom: 2,
  },
  divider: {
    height: 1,
  },
  bullets: {
    gap: spacing.sm,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  bulletDot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
