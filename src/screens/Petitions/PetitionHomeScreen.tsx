import React, { useContext, useCallback } from "react";
import { FlatList } from "react-native";
import { Text } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { TopicCard } from "../../components/common/TopicCard";
import { WeeklyEngagementCard } from "../../components/common/WeeklyEngagementCard";
import TrendingEngagementCard from "../../components/common/TrendingEngagementCard";

import { useTopics } from "../../hooks/common/useTopics";
import { useWeeklyPetition } from "../../hooks/petitions/useWeeklyPetition";
import { useTrendingPetition } from "../../hooks/petitions/useTrendingPetition";

import { Topic } from "../../types/Topic";
import { mapPetitionToTrending } from "../../mappers/trendingCardMapper";
import {mapPetitionToWeekly } from "../../mappers/weeklyCardMapper";

export default function PetitionHomeScreen() {
  const navigation = useNavigation<any>();

  /* -------------------------
     Queries
  --------------------------*/

  const weeklyPetitionQuery = useWeeklyPetition();
  const trendingPetitionsQuery = useTrendingPetition();
  const topicQuery = useTopics();

  /* -------------------------
     Derived UI Data (Mapping)
  --------------------------*/

  const weeklyCardData = weeklyPetitionQuery.data ? mapPetitionToWeekly(weeklyPetitionQuery.data): null;

  const trendingCardData = trendingPetitionsQuery.data?.map(mapPetitionToTrending) ?? [];

  /* -------------------------
     Navigation Handlers
  --------------------------*/

  const openTopic = (topic: Topic) => {
    navigation.navigate("PetitionList", {
      topicId: topic.id,
      title: topic.title,
    });
  };

  const openPetition = (id: number) => {
    navigation.navigate("PetitionDetail", { petitionId: id });
  };

  /* -------------------------
     Render
  --------------------------*/

  return (
    <Screen scroll>

      {/* ---------------- Weekly Petition ---------------- */}
      <Section label="This Week's Petition">
        {weeklyPetitionQuery.loading ? (
          <Text>Loading…</Text>
        ) : weeklyCardData ? (
          <WeeklyEngagementCard
            data={weeklyCardData}
            onPress={() => openPetition(weeklyCardData.id)}
          />
        ) : null}
      </Section>

      {/* ---------------- trending Petitions ---------------- */}
      <Section label="Trending Petitions">
        {trendingPetitionsQuery.loading ? (
          <Text>Loading…</Text>
        ) : (
          <FlatList
            data={trendingCardData}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TrendingEngagementCard
                data={item}
                onPress={() => openPetition(item.id)}
              />
            )}
          />
        )}
      </Section>

      {/* ---------------- topics  ---------------- */}
      <Section label="Browse Petitions by Topic">
        {topicQuery.loading ? (
          <Text>Loading topics…</Text>
        ) : (
          <FlatList
            data={topicQuery.data ?? []}
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