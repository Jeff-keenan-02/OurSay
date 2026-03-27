import React, { useCallback, useContext, useState, useMemo } from "react";
import { useNavigation, useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Screen } from "../../layout/Screen";
import { QuerySection } from "../../components/common/QuerySection";
import { VerticalList } from "../../components/common/VerticalList";
import { ListSummaryBanner } from "../../components/common/ListSummaryBanner";
import { ListSearchBar } from "../../components/common/ListSearchBar";
import { ListFilterChips, TierFilterKey } from "../../components/common/ListFilterChips";
import PollGroupCard from "../../components/PollTopics/PollGroupCard";
import { AuthContext } from "../../context/AuthContext";
import { usePollGroups } from "../../hooks/polls/usePollGroups";
import { PollGroup } from "../../types/PollGroup";
import { getPollAccessState } from "../../utils/pollAccess";
import { spacing } from "../../theme/spacing";

const ACCENT = "#0ea5e9";

type PollStackParams = {
  PollGroups: { topicId: number; title: string };
};

type FilterKey = "all" | "not_started" | "in_progress" | "completed";

const FILTERS = [
  { key: "all" as FilterKey,         label: "All"         },
  { key: "not_started" as FilterKey, label: "Not Started"  },
  { key: "in_progress" as FilterKey, label: "In Progress"  },
  { key: "completed" as FilterKey,   label: "Completed"    },
];

export default function PollListScreen() {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);
  const theme = useTheme();

  const route = useRoute<RouteProp<PollStackParams, "PollGroups">>();
  const { topicId, title } = route.params;

  const pollGroupQuery = usePollGroups(topicId);

  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState<FilterKey>("all");
  const [tierFilter, setTierFilter] = useState<TierFilterKey>("all");

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      pollGroupQuery.reload();
    }, [user, pollGroupQuery.reload])
  );

  const openGroup = (group: PollGroup) => {
    navigation.navigate("SwipePoll", { groupId: group.id, title: group.title });
  };

  const filtered = useMemo(() => {
    const groups = pollGroupQuery.data ?? [];
    return groups.filter((g) => {
      const matchSearch = g.title.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === "all"         ? true :
        filter === "not_started" ? g.status === 0 :
        filter === "in_progress" ? g.status === 1 :
        filter === "completed"   ? g.status === 2 :
        true;
      const matchTier =
        tierFilter === "all"   ? true :
        tierFilter === "tier2" ? g.required_verification_tier >= 2 :
        tierFilter === "tier3" ? g.required_verification_tier >= 3 :
        true;
      return matchSearch && matchFilter && matchTier;
    });
  }, [pollGroupQuery.data, search, filter, tierFilter]);

  const stats = useMemo(() => {
    const groups = pollGroupQuery.data ?? [];
    return {
      total:      groups.length,
      completed:  groups.filter((g) => g.status === 2).length,
      inProgress: groups.filter((g) => g.status === 1).length,
    };
  }, [pollGroupQuery.data]);

  return (
    <Screen scroll title={title} showBack>
      <QuerySection label="" query={pollGroupQuery}>
        {() => (
          <View style={styles.container}>

            <ListSummaryBanner
              accent={ACCENT}
              stats={[
                { label: "Groups",      value: stats.total,      color: ACCENT      },
                { label: "Completed",   value: stats.completed,  color: "#4ade80"   },
                { label: "In Progress", value: stats.inProgress, color: "#fb923c"   },
              ]}
            />

            <ListSearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search poll groups…"
            />

            <ListFilterChips
              chips={FILTERS}
              active={filter}
              onSelect={setFilter}
              accent={ACCENT}
              tierFilter={{ active: tierFilter, onSelect: setTierFilter }}
            />

            <Text style={[styles.resultsLabel, { color: theme.colors.onSurfaceVariant }]}>
              {filtered.length} {filtered.length === 1 ? "group" : "groups"}
            </Text>

            {filtered.length === 0 ? (
              <View style={styles.empty}>
                <MaterialCommunityIcons name="magnify-close" size={32} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No groups match your search</Text>
              </View>
            ) : (
              <VerticalList
                data={filtered}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                  const userTier = user?.verification_tier ?? 0;
                  const state = getPollAccessState(userTier, item);
                  return (
                    <PollGroupCard
                      group={item}
                      state={state}
                      onPress={() => {
                        if (state === "available" || state === "in_progress") openGroup(item);
                      }}
                      onViewAnalytics={() =>
                        navigation.navigate("PollGroupAnalytics", { groupId: item.id })
                      }
                    />
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
});
