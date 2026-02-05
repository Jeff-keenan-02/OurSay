import React, { useContext, useCallback } from "react";
import { FlatList } from "react-native";
import { Text, useTheme, Divider } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import WeeklyPollCard from "../../components/PollTopics/WeeklyPollCard";
import DiscussionCardTrending from "../../components/Discussion/DisscussionCardTrending"
import { AuthContext } from "../../context/AuthContext";
import { useWeeklyPoll } from "../../hooks/polls/useWeeklyPoll";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { useTrendingDiscussions } from "../../hooks/discussions/useTrendingDiscussions";
import { useDiscussionVote } from "../../hooks/discussions/useDiscussionVote";
import { getGreeting } from "../../utils/greeting";
import { CommonActions } from "@react-navigation/native";
import { canOpenPoll } from "../../utils/pollAccess";



export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  
  // Hook to get trending topics
  const { discussions, setDiscussions, loadDiscussions } = useTrendingDiscussions();

  // Top 3 trending prevent errors
  const trending = discussions.slice(0, 3);

  // Hook to vote
  const { vote } = useDiscussionVote(user, setDiscussions);

  //Hook to get the weekly poll
  const { weeklyPoll, loading: pollLoading, loadWeeklyPoll } = useWeeklyPoll(user); 

  const greeting = getGreeting(user?.username);

const openWeeklyPollFromHome = () => {
  if (!weeklyPoll) return;
  if (!canOpenPoll(weeklyPoll, user)) return;

  navigation.navigate("Polls", {
    screen: "SwipePoll",
    params: {
      topicId: weeklyPoll.id,
      title: weeklyPoll.title,
    },
  });
};

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
      subtitle=" Take part in this week's public opinion poll."
    >

      <Section label="Featured This Week">
        {pollLoading ? (
          <Text
          variant="bodyMedium"
          >
            Loading…
          </Text>
        ) : (
          weeklyPoll && (
            <WeeklyPollCard
              poll={weeklyPoll}
              onPress={openWeeklyPollFromHome}
            />
          )
        )}
      </Section>

      {/* Trending Section */}
      <Section label="Trending Discussions">
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