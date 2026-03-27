import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Topic } from "../../types/Topic";
import { spacing } from "../../theme/spacing";

type Props = {
  topics: Topic[];
  onPress: (topic: Topic) => void;
  communityColor?: string;
  showCommunity?: boolean;
};

type OfficialMeta = { icon: string; color: string };

const OFFICIAL_META: Record<string, OfficialMeta> = {
  "Housing & Cost of Living":   { icon: "home-city",    color: "#f97316" },
  "Transport & Infrastructure": { icon: "train-car",    color: "#0ea5e9" },
  "Healthcare & Wellbeing":     { icon: "heart-pulse",  color: "#ef4444" },
  "Climate & Environment":      { icon: "leaf",         color: "#22c55e" },
  "Education":                  { icon: "school",       color: "#a855f7" },
  "Technology & Society":       { icon: "chip",         color: "#6366f1" },
};

const FALLBACK: OfficialMeta = { icon: "folder", color: "#64748b" };

export function TopicBrowser({ topics, onPress, communityColor = "#f97316", showCommunity = true }: Props) {
  const theme = useTheme();

  const official  = topics.filter((t) => t.source === "official");
  const community = topics.filter((t) => t.source === "community");

  return (
    <View style={styles.container}>

      {/* ── Official: coloured 2-col grid ── */}
      {official.length > 0 && (
        <View>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="shield-check" size={14} color={theme.colors.primary} />
            <Text style={[styles.sectionLabel, { color: theme.colors.primary }]}>
              Official Topics
            </Text>
          </View>

          <View style={styles.grid}>
            {official.map((topic) => {
              const meta = OFFICIAL_META[topic.title] ?? FALLBACK;
              return (
                <TouchableOpacity
                  key={topic.id}
                  onPress={() => onPress(topic)}
                  activeOpacity={0.85}
                  style={[styles.card, { backgroundColor: meta.color }]}
                >
                  <MaterialCommunityIcons
                    name={meta.icon}
                    size={28}
                    color="rgba(255,255,255,0.9)"
                  />
                  <Text numberOfLines={2} style={styles.cardText}>
                    {topic.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* ── Community: rows with left accent ── */}
      {showCommunity && community.length > 0 && (
        <View>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="account-group"
              size={14}
              color={theme.colors.primary}
            />
            <Text style={[styles.sectionLabel, { color: theme.colors.primary}]}>
              Community Topics
            </Text>
          </View>

          <View style={styles.list}>
            {community.map((topic) => (
              <TouchableOpacity
                key={topic.id}
                onPress={() => onPress(topic)}
                activeOpacity={0.85}
              >
                <View style={[styles.communityRow, { backgroundColor: theme.colors.surface }]}>
                  <View style={[styles.communityAccent, { backgroundColor: communityColor }]} />
                  <View style={[styles.communityIconCircle, { backgroundColor: communityColor + "18" }]}>
                    <MaterialCommunityIcons
                      name="account-group-outline"
                      size={18}
                      color={communityColor}
                    />
                  </View>
                  <View style={styles.communityBody}>
                    <Text style={[styles.communityTitle, { color: theme.colors.onSurface }]}>
                      {topic.title}
                    </Text>
                    {topic.description && (
                      <Text
                        numberOfLines={1}
                        style={[styles.communityDesc, { color: theme.colors.onSurfaceVariant }]}
                      >
                        {topic.description}
                      </Text>
                    )}
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={theme.colors.onSurfaceVariant}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  /* Official grid */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  card: {
    width: "47%",
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
    minHeight: 100,
    justifyContent: "space-between",
  },
  cardText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 18,
  },

  /* Community rows */
  list: {
    gap: spacing.sm,
  },
  communityRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    overflow: "hidden",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
  },
  communityAccent: {
    width: 4,
    alignSelf: "stretch",
  },
  communityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  communityBody: {
    flex: 1,
    gap: 2,
  },
  communityTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  communityDesc: {
    fontSize: 12,
    opacity: 0.7,
  },
});
