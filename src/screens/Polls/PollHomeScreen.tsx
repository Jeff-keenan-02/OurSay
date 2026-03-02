import React, { useContext, useCallback } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { AuthContext } from "../../context/AuthContext";
import { Screen } from "../../layout/Screen";

import { WeeklyEngagementCard } from "../../components/common/WeeklyEngagementCard";
import TrendingEngagementCard from "../../components/common/TrendingEngagementCard";
import { TopicCard } from "../../components/common/TopicCard";
import { QuerySection } from "../../components/common/QuerySection";
import { HorizontalList } from "../../components/common/HorizontalList";
import { VerticalList } from "../../components/common/VerticalList";

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
      <QuerySection
        label="Featured This Week"
        query={weeklyPollQuery}
      >
        {(data) => {
          const card = mapPollToWeekly(data);

          return (
            <WeeklyEngagementCard
              data={card}
              onPress={() =>
                openPollGroup(card.id, card.title)
              }
            />
          );
        }}
      </QuerySection>

      {/* ---------------- Trending Polls ---------------- */}
      <QuerySection
        label="Trending Polls"
        query={trendingPollQuery}
      >
        {(data) => (
          <HorizontalList
            data={data.map(mapPollToTrending)}
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
      </QuerySection>

      {/* ---------------- Topics ---------------- */}
      <QuerySection
        label="Browse by Topic"
        query={topicsQuery}
      >
        {(data) => (
          <VerticalList
            data={data}
            keyExtractor={(item) => item.id.toString()}
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
      </QuerySection>

    </Screen>
  );
}