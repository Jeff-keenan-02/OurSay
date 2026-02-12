import React, { useContext, useCallback } from "react";
import { FlatList } from "react-native";
import { Text, useTheme, Divider } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import { useWeeklyPoll } from "../../hooks/polls/useWeeklyPoll";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { useTrendingDiscussions } from "../../hooks/discussions/useTrendingDiscussions";
import { useDiscussionVote } from "../../hooks/discussions/useDiscussionVote";
import { getGreeting } from "../../utils/greeting";
import { canOpenPoll } from "../../utils/pollAccess";
import { mapWeeklyPollToCard } from "../../mappers/weeklyCardMapper";
import { WeeklyEngagementCard } from "../../components/common/WeeklyEngagementCard";
import TrendingEngagementCard from "../../components/common/TrendingEngagementCard";


export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);
  const greeting = getGreeting(user?.username);
  

  // Hook to get trending discussions
  const { discussions, loading: discussionsLoading, refresh: refreshDiscussions } = useTrendingDiscussions();

  // Top 3 trending prevent errors
  const trending = discussions.slice(0, 3);

  // Hook to vote
  const { vote } = useDiscussionVote(user, refreshDiscussions);

  //Hook to get the weekly poll
const {
  weeklyPoll,
  loading: pollLoading,
  reload: reloadWeeklyPoll
} = useWeeklyPoll(user);

 const weeklyPollUI = weeklyPoll
  ? mapWeeklyPollToCard(weeklyPoll)
  : null;

const openWeeklyPollFromHome = () => {
  if (!weeklyPoll) return;
  if (!canOpenPoll(weeklyPoll, user)) return;

  navigation.navigate("Polls", {
    screen: "SwipePoll",
    params: {
      groupId: weeklyPoll.id,
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
    reloadWeeklyPoll();
    refreshDiscussions();
  }, [reloadWeeklyPoll, refreshDiscussions])
);

  return (
    <Screen
      scroll
      title={`${greeting}`}
      subtitle=" Take part in this week's public opinion poll."
    >

      <Section label="Featured This Week">
        {pollLoading ? (
          <Text variant="bodyMedium">
            Loading…
          </Text>
        ) : weeklyPollUI ? (
          <WeeklyEngagementCard
            data={weeklyPollUI}
            onPress={openWeeklyPollFromHome}
          />
        ) : null}
      </Section>

      {/* Trending Section
      <Section label="Trending Discussions">
        <FlatList
          data={trending}
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
      </Section> */}
    </Screen> 
  );
}