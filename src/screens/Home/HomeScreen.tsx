import React, { useContext, useCallback } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { AuthContext } from "../../context/AuthContext";
import { Screen } from "../../layout/Screen";
import { WeeklyEngagementCard } from "../../components/common/WeeklyEngagementCard";
import { QuerySection } from "../../components/common/QuerySection";

import { getGreeting } from "../../utils/greeting";
import { useWeeklyPoll } from "../../hooks/polls/useWeeklyPoll";
import { useWeeklyDiscussion } from "../../hooks/discussions/useWeeklyDiscussion";
import { useWeeklyPetition } from "../../hooks/petitions/useWeeklyPetition";
import {mapPollToWeekly, mapDiscussionToWeekly, mapPetitionToWeekly} from "../../mappers/weeklyCardMapper";
import {WeeklyDiscussion} from "../../types/Discussion";
import { Petition } from "../../types/Petition";
import { PollGroup } from "../../types/PollGroup";
import { getPollAccessState } from "../../utils/pollAccess";

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
     Navigation Handlers
  --------------------------------------------------*/
  const openWeeklyPoll = (poll: PollGroup) => {
    navigation.navigate("SwipePoll", {
      groupId: poll.id,
      title: poll.title,
    });
  };

  const openWeeklyDiscussion = (discussion: WeeklyDiscussion) => {
    navigation.navigate("DiscussionDetail", {
      id: discussion.id,
      title: discussion.title,
    });
  };

  const openWeeklyPetition = (petition: Petition) => {
    navigation.navigate("PetitionDetail", {
      petitionId: petition.id,
    });
  };

  /* -------------------------------------------------
     Refresh on Focus
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

      <QuerySection
        label="This Week's Poll"
        query={weeklyPollQuery}
      >
      {(poll) => {
         /* ----------------------------------
            Access Control
         ---------------------------------- */
        const userTier = user?.verification_tier ?? 0;
        const state = getPollAccessState(userTier, poll);

        return (
          <WeeklyEngagementCard
            data={mapPollToWeekly(poll)}
            state={state}
            onPress={() => {
              if (state === "available" || state === "in_progress") {
                openWeeklyPoll(poll);
              }
            }}
          />
        );
      }}
      
      </QuerySection>

      {/* --------------- Weekly Discussion ------------ */}

      <QuerySection
        label="This Week's Discussion"
        query={weeklyDiscussionQuery}
      >
        {(discussion) => (
          <WeeklyEngagementCard
            data={mapDiscussionToWeekly(discussion)}
            onPress={() => openWeeklyDiscussion(discussion)}
          />
        )}
      </QuerySection>

      {/* --------------- Weekly Petition -------------- */}

      <QuerySection
        label="This Week's Petition"
        query={weeklyPetitionQuery}
      >
        {(petition) => (
          <WeeklyEngagementCard
            data={mapPetitionToWeekly(petition)}
            onPress={() => openWeeklyPetition(petition)}
          />
        )}
      </QuerySection>
    </Screen>
  );
}