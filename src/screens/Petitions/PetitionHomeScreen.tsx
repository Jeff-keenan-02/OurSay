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

export default function PetitionHomeScreen() {
  const navigation = useNavigation<any>();

  const { topics, loading: topicsLoading } = useTopics();
  const { petition: weeklyPetition, loading: weeklyLoading } = useWeeklyPetition();
  const { petition: trendingPetition, loading: trendingLoading } = useTrendingPetition();

  const openTopic = (topic: Topic) => {
    navigation.navigate("PetitionsList", {
      topicId: topic.id,
      title: topic.title,
    });
  };

  const openPetition = (id: number) => {
    navigation.navigate("PetitionDetail", { id });
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
      <Section label="Trending Petition">
        {trendingLoading ? (
          <Text>Loading…</Text>
        ) : trendingPetition ? (
          <TrendingEngagementCard
            data={trendingPetition}
            onPress={() => openPetition(trendingPetition.id)}
          />
        ) : null}
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