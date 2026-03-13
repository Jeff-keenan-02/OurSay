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
import { mapPollGroupToTrending } from "../../mappers/trendingCardMapper";

import { Topic } from "../../types/Topic";
import { getPollAccessState } from "../../utils/pollAccess";

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
    <Screen scroll title="Polls" subtitle="Have your say on issues that matter to you!">

      {/* ---------------- Weekly Poll ---------------- */}
      <QuerySection
        label="Featured This Week"
        query={weeklyPollQuery}
      >
        {(data) => {
          const card = mapPollToWeekly(data);
          /* ----------------------------------
            Access Control
          ---------------------------------- */
        const userTier = user?.verification_tier ?? 0;
        const state = getPollAccessState(userTier, data);

          return (
            <WeeklyEngagementCard
              data={card}
              state={state}
              onPress={() => {
                if (state === "available" || state === "in_progress") {
                  openPollGroup(card.id, card.title);
                }
              }}
              />
          );
        }}
      </QuerySection>



      {/* ---------------- Trending Polls ---------------- */}
      <QuerySection
        label="Trending Polls"
        query={trendingPollQuery}
      >
        {(data) => {
          const userTier = user?.verification_tier ?? 0;

          const mapped = data.map((group) =>
            mapPollGroupToTrending(group, userTier)
          );

          return (
            <HorizontalList
              data={mapped}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TrendingEngagementCard
                  data={item}
                  onPress={() => {
                  if (
                    item.type === "poll" &&
                    (item.accessState === "available" ||
                      item.accessState === "in_progress")
                  ) {
                    openPollGroup(item.id, item.title);
                  }
                  }}
                />
              )}
            />
          );
        }}
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