import React, { useContext } from "react";
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity, Text } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTrendingDiscussions } from "../../hooks/discussions/useTrendingDiscussions";
import { useDiscussionVote } from "../../hooks/discussions/useDiscussionVote";
import { AuthContext } from "../../context/AuthContext";
import { Section } from "../../layout/Section";
import { Screen } from "../../layout/Screen";
import { useTopics } from "../../hooks/common/useTopics";
import { Topic } from "../../types/Topic";
import { TopicCard } from "../../components/common/TopicCard";
import { useWeeklyDiscussion } from "../../hooks/discussions/useWeeklyDiscussion";
import { mapWeeklyDiscussionToCard } from "../../mappers/weeklyCardMapper";
import { WeeklyEngagementCard } from "../../components/common/WeeklyEngagementCard";
import TrendingEngagementCard from "../../components/common/TrendingEngagementCard";
import { mapDiscussionToTrending } from "../../mappers/trendingCardMapper";



export default function DiscussionHomeScreen() {

  const navigation: any = useNavigation();
  const { user } = useContext(AuthContext);


  // hook for topics
  const { topics, loading: topicsLoading, } = useTopics();

  //hook for trending discussions
  const { discussions, setDiscussions } = useTrendingDiscussions();
  const trendingData = discussions.map(mapDiscussionToTrending);


  //hook upvoting or downvoting 
  const { vote } = useDiscussionVote (user, setDiscussions);

  //weekly discussion
  const { weeklyDiscussion, loading: weeklyLoading, loadWeekly } = useWeeklyDiscussion();

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
  if (!weeklyDiscussion) return;

  navigation.navigate("Discussions", {
    screen: "DiscussionDetail",
    params: {
      id: weeklyDiscussion.id,
      title: weeklyDiscussion.title,
    },
  });
};

  useFocusEffect(
  React.useCallback(() => {
    loadWeekly();
  }, [loadWeekly])
);
    return (
    <Screen scroll>
      {/* Weekly Section */}
      <Section label="Featured This Week">
        {weeklyLoading ? (
          <Text>Loading...</Text>
        ) : weeklyDiscussion ? (
          <WeeklyEngagementCard
            data={mapWeeklyDiscussionToCard(weeklyDiscussion)}
            onPress={openWeeklyDiscussion}
          />
        ) : null}
      </Section>

      {/* Trending Section */}
      <Section label="Trending Discussions">
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
      </Section>

      {/* topics Section */}
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
