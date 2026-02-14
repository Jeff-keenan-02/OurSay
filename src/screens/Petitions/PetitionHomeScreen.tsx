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
import { mapDiscussionToTrending, mapPetitionToTrending, mapPollToTrending } from "../../mappers/trendingCardMapper";


export default function PetitionHomeScreen() {
  const navigation = useNavigation<any>();

  // Hook for topics
  const { topics, loading: topicsLoading } = useTopics();

  const openTopic = (topic: Topic) => {
    navigation.navigate("PetitionList", {
      topicId: topic.id,
      title: topic.title,
    });
  };
 
    // Hook for weekly petition
  const { petition: weeklyPetition, loading: weeklyLoading } = useWeeklyPetition();

// hook for trending petitions
  const { petitions: trendingPetitions, loading: trendingLoading } = useTrendingPetition();
  const trendingData = trendingPetitions.map(mapPetitionToTrending);
  
  const openPetition = (id: number) => {
    navigation.navigate("PetitionDetail", { petitionId: id });
  };

  return (
    <Screen scroll>

      {/* Weekly */}
      <Section label="Featured This Week">
        {weeklyLoading ? (
          <Text>Loading…</Text>
        ) : weeklyPetition ? (
          <WeeklyEngagementCard
            data={weeklyPetition}
            onPress={() => openPetition(weeklyPetition.id)}
          />
        ) : null}
      </Section>

      {/* Trending */}
      <Section label="Trending Petitions">
      {trendingData.length === 0 ? (
        <Text>Loading…</Text>
      ) : (
        <FlatList
          data={trendingData}
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

      {/* Browse */}
      <Section label="Browse by topic">
        {topicsLoading ? (
          <Text>Loading topics…</Text>
        ) : (
          <FlatList
            data={topics}
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