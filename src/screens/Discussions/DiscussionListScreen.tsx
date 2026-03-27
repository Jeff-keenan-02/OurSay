import React, { useCallback, useContext, useState, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { RouteProp, useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from "../../context/AuthContext";
import { Screen } from "../../layout/Screen";
import { QuerySection } from "../../components/common/QuerySection";
import { VerticalList } from "../../components/common/VerticalList";
import { ListSummaryBanner } from "../../components/common/ListSummaryBanner";
import { ListSearchBar } from "../../components/common/ListSearchBar";
import { ListFilterChips } from "../../components/common/ListFilterChips";
import DiscussionListCard from "../../components/Discussion/DiscussionListCard";
import { useDiscussionByTopic } from "../../hooks/discussions/useDiscussionByTopic";
import { useDiscussionVote } from "../../hooks/discussions/useDiscussionVote";
import { DiscussionListItem } from "../../types/Discussion";
import { spacing } from "../../theme/spacing";

const ACCENT = "#6366f1";

type DiscussionStackParams = {
  DiscussionsList: { topicId: number; title: string };
};

type SortKey = "popular" | "recent" | "comments";

const SORTS = [
  { key: "popular" as SortKey,  label: "Popular",        icon: "fire"                    },
  { key: "recent" as SortKey,   label: "Recent",         icon: "clock-outline"           },
  { key: "comments" as SortKey, label: "Most Discussed", icon: "comment-multiple-outline" },
];

export default function DiscussionsListScreen() {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);
  const theme = useTheme();

  const route = useRoute<RouteProp<DiscussionStackParams, "DiscussionsList">>();
  const { topicId, title } = route.params;

  const topicDiscussionsQuery = useDiscussionByTopic(topicId);
  const { vote } = useDiscussionVote(user, topicDiscussionsQuery.updateData);

  const [search, setSearch] = useState("");
  const [sort, setSort]     = useState<SortKey>("popular");

  useFocusEffect(
    useCallback(() => {
      topicDiscussionsQuery.reload();
    }, [topicDiscussionsQuery.reload])
  );

  const openDiscussion = (id: number) => {
    navigation.navigate("DiscussionDetail", { id });
  };

  const filtered = useMemo(() => {
    const list: DiscussionListItem[] = topicDiscussionsQuery.data ?? [];
    const searched = search
      ? list.filter(
          (d) =>
            d.title.toLowerCase().includes(search.toLowerCase()) ||
            d.body?.toLowerCase().includes(search.toLowerCase())
        )
      : list;

    return [...searched].sort((a, b) => {
      if (sort === "popular")  return b.upvotes - a.upvotes;
      if (sort === "recent")   return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "comments") return b.comment_count - a.comment_count;
      return 0;
    });
  }, [topicDiscussionsQuery.data, search, sort]);

  const stats = useMemo(() => {
    const list: DiscussionListItem[] = topicDiscussionsQuery.data ?? [];
    return {
      total:         list.length,
      totalComments: list.reduce((sum, d) => sum + d.comment_count, 0),
      mostUpvoted:   list.reduce((best, d) => Math.max(best, d.upvotes), 0),
    };
  }, [topicDiscussionsQuery.data]);

  return (
    <Screen scroll showBack title={title}>
      <QuerySection label="" query={topicDiscussionsQuery}>
        {() => (
          <View style={styles.container}>

            <ListSummaryBanner
              accent={ACCENT}
              stats={[
                { label: "Discussions", value: stats.total,    color: ACCENT    },
                { label: "Comments",     value: stats.totalComments, color: "#fb923c" },
                { label: "Most Upvoted", value: stats.mostUpvoted,   color: "#4ade80" },
              ]}
            />

            <ListSearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search discussions…"
            />

            <ListFilterChips
              chips={SORTS}
              active={sort}
              onSelect={setSort}
              accent={ACCENT}
            />

            <Text style={[styles.resultsLabel, { color: theme.colors.onSurfaceVariant }]}>
              {filtered.length} {filtered.length === 1 ? "discussion" : "discussions"}
            </Text>

            {filtered.length === 0 ? (
              <View style={styles.empty}>
                <MaterialCommunityIcons name="magnify-close" size={32} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No discussions match your search</Text>
              </View>
            ) : (
              <VerticalList
                data={filtered}
                keyExtractor={(item: DiscussionListItem) => item.id.toString()}
                ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
                renderItem={({ item }: { item: DiscussionListItem }) => (
                  <DiscussionListCard
                    item={item}
                    onPress={() => openDiscussion(item.id)}
                    onVote={vote}
                  />
                )}
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
