import React, { useContext, useCallback } from "react";
import { FlatList } from "react-native";
import { Text } from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { AuthContext } from "../../context/AuthContext";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";

import { WeeklyEngagementCard } from "../../components/common/WeeklyEngagementCard";
import TrendingEngagementCard from "../../components/common/TrendingEngagementCard";
import { TopicCard } from "../../components/common/TopicCard";

import { useWeeklyPoll } from "../../hooks/polls/useWeeklyPoll";
import { useTrendingPoll } from "../../hooks/polls/useTrendingPoll";
import { useTopics } from "../../hooks/common/useTopics";

import { mapPollToWeekly } from "../../mappers/weeklyCardMapper";
import { mapPollToTrending } from "../../mappers/trendingCardMapper";

import { Topic } from "../../types/Topic";

export default function PollHomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);

  /* -------------------------------------------------
     Queries
  --------------------------------------------------*/

  const weeklyPollQuery = useWeeklyPoll(user);
  const trendingPollQuery = useTrendingPoll(user);
  const topicsQuery = useTopics();

  /* -------------------------------------------------
     Derived UI Data (Mapping)
  --------------------------------------------------*/

  const weeklyPollCard = weeklyPollQuery.data
    ? mapPollToWeekly(weeklyPollQuery.data)
    : null;

  const trendingPollCards =
    trendingPollQuery.data?.map(mapPollToTrending) ?? [];
  /* -------------------------------------------------
     Navigation Handlers
  --------------------------------------------------*/

  const openPollGroup = (groupId: number, title: string) => {
    navigation.navigate("SwipePoll", {
      groupId,
      title,
    });
  };

  const openTopic = (topic: Topic) => {
    navigation.navigate("PollList", {
      topicId: topic.id,
      title: topic.title,
    });
  };

  /* -------------------------------------------------
     Focus Reload
     Keeps page fresh when returning
  --------------------------------------------------*/

  useFocusEffect(
    useCallback(() => {
      weeklyPollQuery.reload();
      trendingPollQuery.reload();
      topicsQuery.reload();
    }, [
      weeklyPollQuery.reload,
      trendingPollQuery.reload,
      topicsQuery.reload,
    ])
  );

  /* -------------------------------------------------
     Render
  --------------------------------------------------*/

  return (
    <Screen scroll>
      {/* ---------------- Weekly Poll ---------------- */}

      <Section label="Featured This Week">
        {weeklyPollQuery.loading ? (
          <Text>Loading…</Text>
        ) : weeklyPollCard ? (
          <WeeklyEngagementCard
            data={weeklyPollCard}
            onPress={() =>
              openPollGroup(
                weeklyPollCard.id,
                weeklyPollCard.title
              )
            }
          />
        ) : null}
      </Section>

      {/* ---------------- Trending Polls -------------- */}

      <Section label="Trending Polls">
        {trendingPollQuery.loading ? (
          <Text>Loading…</Text>
        ) : trendingPollCards.length === 0 ? (
          <Text>No trending polls yet.</Text>
        ) : (
          <FlatList
            data={trendingPollCards}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: 12,
              paddingRight: 16,
            }}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TrendingEngagementCard
                data={item}
                onPress={() =>
                  openPollGroup(item.id, item.title)
                }
              />
            )}
          />
        )}
      </Section>

      {/* ---------------- Topics ---------------- */}

      <Section label="Browse by Topic">
        {topicsQuery.loading ? (
          <Text>Loading topics…</Text>
        ) : (
          <FlatList
            data={topicsQuery.data}
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