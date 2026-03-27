import React, { useCallback } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { Screen } from "../../layout/Screen";
import { QuerySection } from "../../components/common/QuerySection";
import { HorizontalList } from "../../components/common/HorizontalList";
import { WeeklyEngagementCard } from "../../components/common/WeeklyEngagementCard";
import TrendingEngagementCard from "../../components/common/TrendingEngagementCard";
import { TopicBrowser } from "../../components/common/TopicBrowser";

import { useTopics } from "../../hooks/common/useTopics";
import { useWeeklyPetition } from "../../hooks/petitions/useWeeklyPetition";
import { useTrendingPetition } from "../../hooks/petitions/useTrendingPetition";

import { mapPetitionToTrending } from "../../mappers/trendingCardMapper";
import { mapPetitionToWeekly } from "../../mappers/weeklyCardMapper";
import { Topic } from "../../types/Topic";

export default function PetitionHomeScreen() {
  const navigation = useNavigation<any>();

  /* -------------------------------------------------
     Queries
  --------------------------------------------------*/

  const weeklyPetitionQuery = useWeeklyPetition();
  const trendingPetitionsQuery = useTrendingPetition();
  const topicsQuery = useTopics();

  useFocusEffect(
    useCallback(() => {
      weeklyPetitionQuery.reload();
      trendingPetitionsQuery.reload();
    }, [weeklyPetitionQuery.reload, trendingPetitionsQuery.reload])
  );

  /* -------------------------------------------------
     Navigation Handlers
  --------------------------------------------------*/

  const openTopic = (topic: Topic) => {
    navigation.navigate("PetitionList", {
      topicId: topic.id,
      title: topic.title,
    });
  };

  const openPetition = (petitionId: number) => {
    navigation.navigate("PetitionDetail", { petitionId });
  };

  /* -------------------------------------------------
     Render
  --------------------------------------------------*/

  return (
    <Screen scroll title="Petitions"
      subtitle="Take action on issues that matter to you">

      {/* ---------------- Weekly Petition ---------------- */}
      <QuerySection
        label="This Week's Petition"
        query={weeklyPetitionQuery}
      >
        {(data) => (
          <WeeklyEngagementCard
            data={mapPetitionToWeekly(data)}
            onPress={() => openPetition(data.id)}
            onViewAnalytics={() =>
              navigation.navigate("PetitionAnalyticsDetail", {
                petitionId: data.id,
                title: data.title,
              })
            }
          />
        )}
      </QuerySection>

      {/* ---------------- Trending Petitions ---------------- */}
      <QuerySection
        label="Trending Petitions"
        query={trendingPetitionsQuery}
      >
        {(data) => (
          <HorizontalList
            data={data.map(mapPetitionToTrending)}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TrendingEngagementCard
                data={item}
                onPress={() => openPetition(item.id)}
                onViewAnalytics={() =>
                  navigation.navigate("PetitionAnalyticsDetail", {
                    petitionId: item.id,
                    title: item.title,
                  })
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
          <TopicBrowser topics={data} onPress={openTopic} />
        )}
      </QuerySection>

    </Screen>
  );
}