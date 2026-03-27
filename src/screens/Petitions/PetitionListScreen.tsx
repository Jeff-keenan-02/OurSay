import React, { useCallback, useState, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme, ProgressBar, Divider } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute, useFocusEffect, RouteProp } from "@react-navigation/native";
import { Screen } from "../../layout/Screen";
import { QuerySection } from "../../components/common/QuerySection";
import { VerticalList } from "../../components/common/VerticalList";
import { ListSummaryBanner } from "../../components/common/ListSummaryBanner";
import { ListSearchBar } from "../../components/common/ListSearchBar";
import { ListFilterChips, TierFilterKey } from "../../components/common/ListFilterChips";
import { AccessStatusChip } from "../../components/common/AccessStatusChip";
import { usePetitionsByTopic } from "../../hooks/petitions/usePetitionsByTopic";
import { Petition } from "../../types/Petition";
import { spacing } from "../../theme/spacing";
import { getProgressColor } from "../../utils/progressColor";

const ACCENT = "#f59e0b";

type RouteParams = {
  PetitionList: { topicId: number; title: string };
};

type FilterKey = "all" | "open" | "goal_met";

const FILTERS = [
  { key: "all" as FilterKey,      label: "All"          },
  { key: "open" as FilterKey,     label: "In Progress"  },
  { key: "goal_met" as FilterKey, label: "Goal Reached" },
];

export default function PetitionListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, "PetitionList">>();
  const { topicId, title } = route.params;
  const theme = useTheme();

  const petitionsQuery = usePetitionsByTopic(topicId);

  const [search, setSearch]         = useState("");
  const [filter, setFilter]         = useState<FilterKey>("all");
  const [tierFilter, setTierFilter] = useState<TierFilterKey>("all");

  useFocusEffect(
    useCallback(() => {
      petitionsQuery.reload();
    }, [petitionsQuery.reload])
  );

  const openPetition = (petitionId: number) => {
    navigation.navigate("PetitionDetail", { petitionId });
  };

  const openAnalytics = (petitionId: number, petitionTitle: string) => {
    navigation.navigate("PetitionAnalyticsDetail", { petitionId, title: petitionTitle });
  };

  const filtered = useMemo(() => {
    const list = petitionsQuery.data ?? [];
    return list.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === "all"      ? true :
        filter === "open"     ? p.progress < 1 :
        filter === "goal_met" ? p.progress >= 1 :
        true;
      const matchTier =
        tierFilter === "all"   ? true :
        tierFilter === "tier2" ? p.required_verification_tier >= 2 :
        tierFilter === "tier3" ? p.required_verification_tier >= 3 :
        true;
      return matchSearch && matchFilter && matchTier;
    });
  }, [petitionsQuery.data, search, filter, tierFilter]);

  const stats = useMemo(() => {
    const list = petitionsQuery.data ?? [];
    const signed = list.filter((p) => p.signatures > 0).length;
    const goalMet = list.filter((p) => p.progress >= 1).length;
    return { total: list.length, signed, goalMet };
  }, [petitionsQuery.data]);

  return (
    <Screen title={title} scroll showBack>
      <QuerySection label="" query={petitionsQuery}>
        {() => (
          <View style={styles.container}>

            <ListSummaryBanner
              accent={ACCENT}
              stats={[
                { label: "Petitions",    value: stats.total,   color: ACCENT    },
                { label: "Signed",       value: stats.signed,  color: "#60a5fa" },
                { label: "Goal Reached", value: stats.goalMet, color: "#4ade80" },
              ]}
            />

            <ListSearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search petitions…"
            />

            <ListFilterChips
              chips={FILTERS}
              active={filter}
              onSelect={setFilter}
              accent={ACCENT}
              tierFilter={{ active: tierFilter, onSelect: setTierFilter }}
            />

            <Text style={[styles.resultsLabel, { color: theme.colors.onSurfaceVariant }]}>
              {filtered.length} {filtered.length === 1 ? "petition" : "petitions"}
            </Text>

            {filtered.length === 0 ? (
              <View style={styles.empty}>
                <MaterialCommunityIcons name="magnify-close" size={32} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No petitions match your search</Text>
              </View>
            ) : (
              <VerticalList
                data={filtered}
                keyExtractor={(item: Petition) => item.id.toString()}
                ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
                renderItem={({ item }: { item: Petition }) => {
                  const isGoalMet = item.signatures >= item.signature_goal;
                  return (
                    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                      <View style={[styles.cardAccent, { backgroundColor: isGoalMet ? "#4ade80" : ACCENT }]} />
                      <View style={styles.cardContent}>
                        <TouchableOpacity onPress={() => openPetition(item.id)} activeOpacity={0.8} style={styles.cardBody}>
                          <View style={styles.cardTop}>
                            <Text variant="titleSmall" style={{ flex: 1, fontWeight: "600" }} numberOfLines={2}>
                              {item.title}
                            </Text>
                            <AccessStatusChip variant="tier" requiredTier={item.required_verification_tier} />
                          </View>

                          {item.description ? (
                            <Text variant="bodySmall" numberOfLines={2} style={{ opacity: 0.6 }}>
                              {item.description}
                            </Text>
                          ) : null}

                          <ProgressBar
                            progress={item.progress}
                            color={getProgressColor(item.progress, isGoalMet)}
                            style={styles.progressBar}
                          />

                          <View style={styles.metaRow}>
                            <View style={styles.metaLeft}>
                              {isGoalMet && (
                                <View style={styles.goalBadge}>
                                  <MaterialCommunityIcons name="check-circle" size={12} color="#4ade80" />
                                  <Text style={styles.goalBadgeText}>Goal reached</Text>
                                </View>
                              )}
                              <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                                {item.signatures.toLocaleString()} / {item.signature_goal.toLocaleString()} signatures
                              </Text>
                            </View>
                            <Text variant="bodySmall" style={{ opacity: 0.45 }}>
                              {Math.round(item.progress * 100)}%
                            </Text>
                          </View>
                        </TouchableOpacity>

                        <Divider />
                        <View style={styles.analyticsRow}>
                          <TouchableOpacity
                            onPress={() => openAnalytics(item.id, item.title)}
                            activeOpacity={0.7}
                            style={styles.analyticsButton}
                          >
                            <MaterialCommunityIcons name="chart-bar" size={15} color={ACCENT} />
                            <Text style={[styles.analyticsText, { color: ACCENT }]}>View Analytics</Text>
                          </TouchableOpacity>
                          <AccessStatusChip variant={item.has_signed ? "signed" : "unsigned"} />
                        </View>
                      </View>
                    </View>
                  );
                }}
              />
            )}
          </View>
        )}
      </QuerySection>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  resultsLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  empty: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.6,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
  },
  cardAccent: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    flexDirection: "column",
  },
  cardBody: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  progressBar: {
    height: 6,
    borderRadius: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaLeft: {
    gap: 3,
  },
  goalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  goalBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4ade80",
  },
  analyticsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  analyticsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  analyticsText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
