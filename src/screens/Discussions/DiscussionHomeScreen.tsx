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
import { QuerySection } from "../../components/common/QuerySection";
import { HorizontalList } from "../../components/common/HorizontalList";
import { VerticalList } from "../../components/common/VerticalList";
import { DiscussionListItem, WeeklyDiscussion } from "../../types/Discussion";

export default function DiscussionHomeScreen() {
  const navigation: any = useNavigation();
  const { user } = useContext(AuthContext);

  /* -------------------------------------------------
     Queries
  --------------------------------------------------*/

  const topicsQuery = useTopics();
  const trendingQuery = useTrendingDiscussions();
  const weeklyDiscussionQuery = useWeeklyDiscussion();
  
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

  const openDiscussion = useCallback((id: number, title: string) => {
    navigation.navigate("Discussions", {
      screen: "DiscussionDetail",
      params: {
        id,
        title,
      },
    });
  }, [navigation]);

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
        <QuerySection
        label="Featured This Week"
        query={weeklyDiscussionQuery}
      >
        {(data) => (
          <WeeklyEngagementCard
            data={mapDiscussionToWeekly(data)}
            onPress={() => openDiscussion(data.id, data.title)}
          />
        )}
      </QuerySection>

      {/* --------------- Trending Disccusisons  ------------ */}
      <QuerySection
      label="Trending Discussions"
      query={trendingQuery}
    >
      {(data) => (
        <HorizontalList
          data={data.map(mapDiscussionToTrending)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TrendingEngagementCard
              data={item}
              onPress={() =>
                openDiscussion(item.id, item.title)
              }
              onVote={vote}
            />
          )}
        />
      )}
    </QuerySection>

      {/* --------------- Topics ------------ */}
    <QuerySection
      label="Browse by topic"
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