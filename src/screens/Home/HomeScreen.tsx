import React, { useContext, useCallback } from "react";
import { Text} from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import { useWeeklyPoll } from "../../hooks/polls/useWeeklyPoll";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { getGreeting } from "../../utils/greeting";
import { canOpenPoll } from "../../utils/pollAccess";
import { mapWeeklyDiscussionToCard, mapWeeklyPetitionToCard, mapWeeklyPollToCard } from "../../mappers/weeklyCardMapper";
import { WeeklyEngagementCard } from "../../components/common/WeeklyEngagementCard";
import { useWeeklyDiscussion } from "../../hooks/discussions/useWeeklyDiscussion";
import { useWeeklyPetition } from "../../hooks/petitions/useWeeklyPetition";



export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);
  const greeting = getGreeting(user?.username);
  


  //Hook to get the weekly poll
 const {weeklyPoll, loading: weeklyPollLoading, reload: reloadWeeklyPoll} = useWeeklyPoll(user);
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


  //Hook to get weekly discussion
  const { weeklyDiscussion, loading: weeklyDiscussionLoading, loadWeekly } = useWeeklyDiscussion();

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

    // Hook for weekly petition
  const { petition: weeklyPetition, loading: weeklyPetitionLoading } = useWeeklyPetition();
  const openWeeklyPetition = () => {
    if (!weeklyPetition) return;
      navigation.navigate("Petitions", {
        screen: "PetitionDetail",
        params: {
          id: weeklyPetition.id,
          title: weeklyPetition.title,
        },
      });
};

 useFocusEffect(
  useCallback(() => {
    reloadWeeklyPoll();
    loadWeekly();
  }, [reloadWeeklyPoll, loadWeekly])
);

  return (
    <Screen
      scroll
      title={`${greeting}`}
      subtitle=" Take part in this week's public opinion poll."
    >

      <Section label="This Week's Poll">
        {weeklyPollLoading ? (
          <Text variant="bodyMedium">Loading…</Text>
        ) : weeklyPoll ? (
          <WeeklyEngagementCard
            data={mapWeeklyPollToCard(weeklyPoll)}
            onPress={openWeeklyPollFromHome}
          />
        ) : null}
      </Section>


      {/* Weekly Section */}
      <Section label="This Week Discussion">
        {weeklyDiscussionLoading ? (
                <Text variant="bodyMedium">Loading...</Text>
              ) : weeklyDiscussion ? (
                <WeeklyEngagementCard
                  data={mapWeeklyDiscussionToCard(weeklyDiscussion)}
                  onPress={openWeeklyDiscussion}
                />
              ) : null}
      </Section>


      {/* Weekly */}
      <Section label="This Week's Petition">
        {weeklyPetitionLoading ? (
          <Text variant="bodyMedium">Loading…</Text>
          ) : weeklyPetition ? (
          <WeeklyEngagementCard
            data={mapWeeklyPetitionToCard(weeklyPetition)}
            onPress={() => openWeeklyPetition()}
          />
          ) : null}
      </Section>


    </Screen> 
  );
}
