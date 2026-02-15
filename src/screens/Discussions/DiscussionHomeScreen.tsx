import React, { useContext, useCallback } from "react";
import { FlatList, Text } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { TopicCard } from "../../components/common/TopicCard";
import { WeeklyEngagementCard } from "../../components/common/WeeklyEngagementCard";
import TrendingEngagementCard from "../../components/common/TrendingEngagementCard";

import { AuthContext } from "../../context/AuthContext";
import { useTopics } from "../../hooks/common/useTopics";
import { useTrendingDiscussions } from "../../hooks/discussions/useTrendingDiscussions";
import { useDiscussionVote } from "../../hooks/discussions/useDiscussionVote";
import { useWeeklyDiscussion } from "../../hooks/discussions/useWeeklyDiscussion";

import { Topic } from "../../types/Topic";
import { mapDiscussionToWeekly } from "../../mappers/weeklyCardMapper";
import { mapDiscussionToTrending } from "../../mappers/trendingCardMapper";

export default function DiscussionHomeScreen() {
  const navigation: any = useNavigation();
  const { user } = useContext(AuthContext);

  /* -------------------------------------------------
     Queries
  --------------------------------------------------*/

  const topicsQuery = useTopics();
  const trendingQuery = useTrendingDiscussions();
  const weeklyDiscussionQuery = useWeeklyDiscussion();

  /* -------------------------
     Derived UI Data (Mapping)
  --------------------------*/
  const weeklyDiscussionCard = weeklyDiscussionQuery.data? mapDiscussionToWeekly(weeklyDiscussionQuery.data): null;

  const trendingData = trendingQuery.data?.map(mapDiscussionToTrending) ?? [];

  
  /* -------------------------------------------------
     Mutations
  --------------------------------------------------*/

const { vote } = useDiscussionVote(user, trendingQuery.updateData);

  /* -------------------------------------------------
     Navigation
  --------------------------------------------------*/

  const openTopic = (topic: Topic) => {
    navigation.navigate("DiscussionsList", {
      topicId: topic.id,
      title: topic.title,
    });
  };

  const openDiscussion = (id: number, title: string) => {
    navigation.navigate("Discussions", {
      screen: "DiscussionDetail",
      params: { id, title },
    });
  };

  const openWeeklyDiscussion = () => {
    if (!weeklyDiscussionQuery.data) return;

    navigation.navigate("Discussions", {
      screen: "DiscussionDetail",
      params: {
        id: weeklyDiscussionQuery.data.id,
        title: weeklyDiscussionQuery.data.title,
      },
    });
  };

  /* -------------------------------------------------
     Refresh on Focus
  --------------------------------------------------*/

  useFocusEffect(
    useCallback(() => {
      weeklyDiscussionQuery.reload();
    }, [weeklyDiscussionQuery.reload])
  );

  /* -------------------------------------------------
     Render
  --------------------------------------------------*/

  return (
    <Screen scroll>

      {/* --------------- Weekly Disscussion  ------------ */}
      <Section label="Featured This Week">
        {weeklyDiscussionQuery.loading ? (
          <Text>Loading...</Text>
        ) : weeklyDiscussionQuery.data ? (
          <WeeklyEngagementCard
            data={mapDiscussionToWeekly(weeklyDiscussionQuery.data)}
            onPress={openWeeklyDiscussion}
          />
        ) : null}
      </Section>

      {/* --------------- Trending Disccusisons  ------------ */}
      <Section label="Trending Discussions">
        {trendingQuery.loading ? (
          <Text>Loading…</Text>
        ) : (
          <FlatList
            data={trendingData}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 16 }}
            renderItem={({ item }) => (
              <TrendingEngagementCard
                data={item}
                onPress={() => openDiscussion(item.id, item.title)}
                onVote={vote}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        )}
      </Section>

      {/* --------------- Topics ------------ */}
      <Section label="Browse by topic">
        {topicsQuery.loading ? (
          <Text>Loading topics…</Text>
        ) : (
          <FlatList
            data={topicsQuery.data ?? []}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item }) => (
              <TopicCard
                title={item.title}
                description={item.description}
                icon="dots-grid"
                onPress={() => openTopic(item)}
              />
            )}
          />
        )}
      </Section>

    </Screen>
  );
}