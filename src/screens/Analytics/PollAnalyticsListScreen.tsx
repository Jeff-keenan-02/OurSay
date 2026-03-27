import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme, ActivityIndicator } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";
import { useApiClient } from "../../hooks/common/useApiClient";

type PollGroup = {
  id: number;
  title: string;
  topic: string;
  question_count: number;
  respondent_count: number;
};

type OfficialMeta = { icon: string; color: string };

const OFFICIAL_META: Record<string, OfficialMeta> = {
  "Housing & Cost of Living":   { icon: "home-city",   color: "#f97316" },
  "Transport & Infrastructure": { icon: "train-car",   color: "#0ea5e9" },
  "Healthcare & Wellbeing":     { icon: "heart-pulse", color: "#ef4444" },
  "Climate & Environment":      { icon: "leaf",        color: "#22c55e" },
  "Education":                  { icon: "school",      color: "#a855f7" },
  "Technology & Society":       { icon: "chip",        color: "#6366f1" },
};

function isOfficial(topic: string) {
  return topic in OFFICIAL_META;
}

function GroupRow({ group, accentColor, onPress }: { group: PollGroup; accentColor: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.row, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.rowAccent, { backgroundColor: accentColor }]} />
        <View style={styles.rowBody}>
          <Text
            variant="bodyMedium"
            style={{ fontWeight: "600", color: theme.colors.onSurface }}
            numberOfLines={2}
          >
            {group.title}
          </Text>
          <View style={styles.rowMeta}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="help-circle-outline" size={13} color={theme.colors.onSurfaceVariant} />
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {group.question_count} question{group.question_count !== 1 ? "s" : ""}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="account-multiple-outline" size={13} color={theme.colors.onSurfaceVariant} />
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {Number(group.respondent_count).toLocaleString()} participant{Number(group.respondent_count) === 1 ? "" : "s"}
              </Text>
            </View>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={18} color={theme.colors.onSurfaceVariant} />
      </View>
    </TouchableOpacity>
  );
}

function TopicSection({
  topicName,
  groups,
  onPressItem,
}: {
  topicName: string;
  groups: PollGroup[];
  onPressItem: (g: PollGroup) => void;
}) {
  const theme = useTheme();
  const meta = OFFICIAL_META[topicName];
  const accentColor = meta?.color ?? "#64748b";
  const totalQuestions = groups.reduce((sum, g) => sum + Number(g.question_count), 0);
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.topicSection}>
      <TouchableOpacity onPress={() => setOpen((o) => !o)} activeOpacity={0.7}>
        <View style={[styles.topicHeader, { backgroundColor: accentColor + "12", borderColor: accentColor + "30" }]}>
          <View style={[styles.topicIconCircle, { backgroundColor: accentColor + "22" }]}>
            <MaterialCommunityIcons
              name={meta?.icon ?? "account-group-outline"}
              size={16}
              color={accentColor}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="labelLarge" style={{ fontWeight: "700", color: accentColor }}>
              {topicName}
            </Text>
            <Text variant="labelSmall" style={{ opacity: 0.5 }}>
              {groups.length} group{groups.length !== 1 ? "s" : ""} · {totalQuestions} question{totalQuestions !== 1 ? "s" : ""}
            </Text>
          </View>
          <MaterialCommunityIcons
            name={open ? "chevron-up" : "chevron-down"}
            size={20}
            color={accentColor}
          />
        </View>
      </TouchableOpacity>

      {open && (
        <View style={[styles.groupList, { borderColor: accentColor + "30" }]}>
          {groups.map((group, i) => (
            <View key={group.id}>
              <GroupRow group={group} accentColor={accentColor} onPress={() => onPressItem(group)} />
              {i < groups.length - 1 && (
                <View style={[styles.rowDivider, { backgroundColor: theme.colors.outline + "30" }]} />
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function PollAnalyticsListScreen({ navigation }: any) {
  const theme = useTheme();
  const api = useApiClient();
  const [groups, setGroups] = useState<PollGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/analytics/polls").then((res: any) => {
      setGroups(res);
      setLoading(false);
    });
  }, []);

  const officialTopics = Array.from(
    new Set(groups.filter((g) => isOfficial(g.topic)).map((g) => g.topic))
  ).sort((a, b) => Object.keys(OFFICIAL_META).indexOf(a) - Object.keys(OFFICIAL_META).indexOf(b));

  const communityTopics = Array.from(
    new Set(groups.filter((g) => !isOfficial(g.topic)).map((g) => g.topic))
  ).sort();

  const openDetail = (group: PollGroup) => {
    navigation.navigate("PollGroupAnalytics", { groupId: group.id });
  };

  return (
    <Screen scroll title="Poll Analytics" subtitle="Explore anonymous voting results by topic." showBack>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
        </View>
      ) : groups.length === 0 ? (
        <Text style={styles.empty}>No poll results available yet.</Text>
      ) : (
        <View style={styles.container}>
          {officialTopics.length > 0 && (
            <View>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="shield-check" size={14} color={theme.colors.primary} />
                <Text style={[styles.sectionLabel, { color: theme.colors.primary }]}>
                  Official Topics
                </Text>
              </View>
              <View style={styles.topicList}>
                {officialTopics.map((topic) => (
                  <TopicSection
                    key={topic}
                    topicName={topic}
                    groups={groups.filter((g) => g.topic === topic)}
                    onPressItem={openDetail}
                  />
                ))}
              </View>
            </View>
          )}

          {communityTopics.length > 0 && (
            <View>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="account-group" size={14} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Community Topics
                </Text>
              </View>
              <View style={styles.topicList}>
                {communityTopics.map((topic) => (
                  <TopicSection
                    key={topic}
                    topicName={topic}
                    groups={groups.filter((g) => g.topic === topic)}
                    onPressItem={openDetail}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  loadingContainer: {
    paddingTop: spacing.lg,
    alignItems: "center",
  },
  empty: {
    textAlign: "center",
    opacity: 0.5,
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  topicList: {
    gap: spacing.md,
  },
  topicSection: {
    gap: spacing.xs,
  },
  topicHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  topicIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  groupList: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
  },
  rowAccent: {
    width: 3,
    alignSelf: "stretch",
    borderRadius: 2,
    marginLeft: spacing.sm,
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  rowMeta: {
    flexDirection: "row",
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  rowDivider: {
    height: 1,
    marginHorizontal: spacing.md,
  },
});
