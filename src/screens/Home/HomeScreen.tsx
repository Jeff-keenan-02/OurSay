import React, { useContext, useCallback } from "react";
import { Text } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { AuthContext } from "../../context/AuthContext";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { WeeklyEngagementCard } from "../../components/common/WeeklyEngagementCard";

import { getGreeting } from "../../utils/greeting";
import { canOpenPoll } from "../../utils/pollAccess";

import { useWeeklyPoll } from "../../hooks/polls/useWeeklyPoll";
import { useWeeklyDiscussion } from "../../hooks/discussions/useWeeklyDiscussion";
import { useWeeklyPetition } from "../../hooks/petitions/useWeeklyPetition";

import {
  mapPollToWeekly,
  mapDiscussionToWeekly,
  mapPetitionToWeekly,
} from "../../mappers/weeklyCardMapper";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);
  const greeting = getGreeting(user?.username);

  /* -------------------------------------------------
     Queries
  --------------------------------------------------*/

  const weeklyPollQuery = useWeeklyPoll(user);
  const weeklyDiscussionQuery = useWeeklyDiscussion();
  const weeklyPetitionQuery = useWeeklyPetition();


  /* -------------------------------------------------
   Derived UI (Mapping)
--------------------------------------------------*/

const weeklyPollCard =
  weeklyPollQuery.data
    ? mapPollToWeekly(weeklyPollQuery.data)
    : null;

const weeklyDiscussionCard =
  weeklyDiscussionQuery.data
    ? mapDiscussionToWeekly(weeklyDiscussionQuery.data)
    : null;

const weeklyPetitionCard =
  weeklyPetitionQuery.data
    ? mapPetitionToWeekly(weeklyPetitionQuery.data)
    : null;

  /* -------------------------------------------------
     Navigation Handlers
  --------------------------------------------------*/

  const openWeeklyPoll = () => {
    if (!weeklyPollQuery.data) return;
    if (!canOpenPoll(weeklyPollQuery.data, user)) return;

    navigation.navigate("Polls", {
      screen: "SwipePoll",
      params: {
        groupId: weeklyPollQuery.data.id,
        title: weeklyPollQuery.data.title,
      },
    });
  };

  const openWeeklyDiscussion = () => {
    if (!weeklyDiscussionQuery.data) return;

    navigation.navigate("Discussions", {
      screen: "DiscussionDetail",
      params: {
        id: weeklyDiscussionQuery.data.id,
        title: weeklyDiscussionQuery.data.title,
      },
    });
  };

  const openWeeklyPetition = () => {
    if (!weeklyPetitionQuery.data) return;

    navigation.navigate("Petitions", {
      screen: "PetitionDetail",
      params: {
        id: weeklyPetitionQuery.data.id,
        title: weeklyPetitionQuery.data.title,
      },
    });
  };

  /* -------------------------------------------------
     Focus Reload
     (Keeps homepage always fresh)
  --------------------------------------------------*/

  useFocusEffect(
    useCallback(() => {
      weeklyPollQuery.reload();
      weeklyDiscussionQuery.reload();
      weeklyPetitionQuery.reload();
    }, [
      weeklyPollQuery.reload,
      weeklyDiscussionQuery.reload,
      weeklyPetitionQuery.reload,
    ])
  );

  /* -------------------------------------------------
     Render
  --------------------------------------------------*/

  return (
    <Screen
      scroll
      title={greeting}
      subtitle="Take part in this week's public opinion poll."
    >
      {/* ---------------- Weekly Poll ---------------- */}

      <Section label="This Week's Poll">
        {weeklyPollQuery.loading ? (
          <Text>Loading…</Text>
        ) : weeklyPollCard ? (
          <WeeklyEngagementCard
            data={weeklyPollCard}
            onPress={openWeeklyPoll}
          />
        ) : null}
      </Section>

      {/* --------------- Weekly Discussion ------------ */}

      <Section label="This Week's Discussion">
        {weeklyDiscussionQuery.loading ? (
          <Text>Loading…</Text>
        ) : weeklyDiscussionCard ? (
          <WeeklyEngagementCard
            data={weeklyDiscussionCard}
            onPress={openWeeklyDiscussion}
          />
        ) : null}
      </Section>

      {/* --------------- Weekly Petition -------------- */}

      <Section label="This Week's Petition">
        {weeklyPetitionQuery.loading ? (
          <Text>Loading…</Text>
        ) : weeklyPetitionCard ? (
          <WeeklyEngagementCard
            data={weeklyPetitionCard}
            onPress={openWeeklyPetition}
          />
        ) : null}
      </Section>
    </Screen>
  );
}