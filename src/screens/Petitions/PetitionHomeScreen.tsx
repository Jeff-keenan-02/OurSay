import React from "react";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "../../layout/Screen";
import { QuerySection } from "../../components/common/QuerySection";
import { HorizontalList } from "../../components/common/HorizontalList";
import { VerticalList } from "../../components/common/VerticalList";
import { WeeklyEngagementCard } from "../../components/common/WeeklyEngagementCard";
import TrendingEngagementCard from "../../components/common/TrendingEngagementCard";
import { TopicCard } from "../../components/common/TopicCard";

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
              />
            )}
          />
        )}
      </QuerySection>

      {/* ---------------- Topics ---------------- */}
      <QuerySection
        label="Browse Petitions by Topic"
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