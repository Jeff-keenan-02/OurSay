import React, { useContext, useCallback } from "react";
import { FlatList } from "react-native";
import { Text, useTheme, Divider } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import WeeklyPollCard from "../components/PollTopics/WeeklyPollCard";

import DiscussionCardTrending from "../components/Discussion/DisscussionCardTrending"

import { AuthContext } from "../context/AuthContext";
import { useWeeklyPoll } from "../hooks/useWeeklyPoll";
import { Screen } from "../layout/Screen";
import { Section } from "../layout/Section";
import { useTrendingDiscussions } from "../hooks/useTrendingDiscussions";
import { useDiscussionVote } from "../hooks/useDiscussionVote";
import { getGreeting } from "../utils/greeting";



export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const API = "http://localhost:3000";

  // Hook to get trending topics
  const { discussions, setDiscussions, loadDiscussions } = useTrendingDiscussions(API);

    // Top 3 trending prevent errors
  const trending = discussions.slice(0, 3);

  // Hook to vote
  const { vote } = useDiscussionVote(API, user, setDiscussions);

  //Hook to get the weekly poll
  const { weeklyPoll, loading: pollLoading, loadWeeklyPoll } = useWeeklyPoll(API, user); 

  const greeting = getGreeting(user?.username);

  const openDiscussion = (id: number, title: string) => {
    navigation.navigate("Discussions", {
      screen: "DiscussionDetail",
      params: { id, title },
    });
  };

  useFocusEffect(
    useCallback(() => {
      loadWeeklyPoll();
      loadDiscussions();
    }, [])
  );

  return (
    <Screen
      scroll
      title="OurSay"
      subtitle="Your community. Your voice. Take part in this week's public opinion poll."
    >
      {/* Greeting */}
      <Text
        variant="labelLarge"
        style={{
          color: theme.colors.onSurfaceVariant,
          marginBottom: 12,
        }}
      >
        {greeting}
      </Text>

      <Section label="Featured This Week">
        {pollLoading ? (
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Loading…</Text>
        ) : (
          weeklyPoll && (
            <WeeklyPollCard
              poll={weeklyPoll}
              onPress={() =>
                navigation.navigate("Polls", {
                  screen: "SwipePoll",
                  params: {
                    topicId: weeklyPoll.id,
                    title: weeklyPoll.title,
                  },
                })
              }
            />
          )
        )}
      </Section>

      {/* Trending Section */}
      <Section label="Trending Discussions" subtitle="Top conversations happening right now">
        <FlatList
          data={trending}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingRight: 16 }}
          renderItem={({ item }) => (
            <DiscussionCardTrending
              discussion={item}
              onPress={() => openDiscussion(item.id, item.title)}
              onVote={vote}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      </Section>
    </Screen>
  );
}