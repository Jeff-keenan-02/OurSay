import React, { useContext, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { AuthContext } from "../../context/AuthContext";
import { Screen } from "../../layout/Screen";
import { WeeklyEngagementCard } from "../../components/common/WeeklyEngagementCard";
import { QuerySection } from "../../components/common/QuerySection";

import { getGreeting } from "../../utils/greeting";
import { useWeeklyPoll } from "../../hooks/polls/useWeeklyPoll";
import { useWeeklyDiscussion } from "../../hooks/discussions/useWeeklyDiscussion";
import { useWeeklyPetition } from "../../hooks/petitions/useWeeklyPetition";
import { mapPollToWeekly, mapDiscussionToWeekly, mapPetitionToWeekly } from "../../mappers/weeklyCardMapper";
import { WeeklyDiscussion } from "../../types/Discussion";
import { Petition } from "../../types/Petition";
import { PollGroup } from "../../types/PollGroup";
import { getPollAccessState } from "../../utils/pollAccess";

function getWeekLabel() {
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleDateString("en-IE", { month: "long" });
  const year = now.getFullYear();
  return `Week of ${day} ${month} ${year}`;
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const greeting = getGreeting(user?.username);
  const weekLabel = getWeekLabel();
  const isUnverified = !user?.verification_tier;

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
    navigation.navigate("SwipePoll", { groupId: poll.id, title: poll.title });
  };

  const openWeeklyDiscussion = (discussion: WeeklyDiscussion) => {
    navigation.navigate("DiscussionDetail", { id: discussion.id, title: discussion.title });
  };

  const openWeeklyPetition = (petition: Petition) => {
    navigation.navigate("PetitionDetail", { petitionId: petition.id });
  };

  /* -------------------------------------------------
     Refresh on Focus
  --------------------------------------------------*/

  useFocusEffect(
    useCallback(() => {
      weeklyPollQuery.reload();
      weeklyDiscussionQuery.reload();
      weeklyPetitionQuery.reload();
    }, [weeklyPollQuery.reload, weeklyDiscussionQuery.reload, weeklyPetitionQuery.reload])
  );

  /* -------------------------------------------------
     Render
  --------------------------------------------------*/

  return (
    <Screen scroll title={greeting} subtitle={weekLabel}>

      {/* Verification nudge */}
      {isUnverified && (
        <TouchableOpacity
          onPress={() => navigation.navigate("Verify")}
          activeOpacity={0.85}
          style={[styles.nudge, { backgroundColor: theme.colors.primary + "18", borderColor: theme.colors.primary + "40" }]}
        >
          <MaterialCommunityIcons name="shield-account-outline" size={20} color={theme.colors.primary} />
          <View style={styles.nudgeText}>
            <Text style={[styles.nudgeTitle, { color: theme.colors.primary }]}>Verify your account</Text>
            <Text style={[styles.nudgeSub, { color: theme.colors.onSurfaceVariant }]}>
              Unlock higher-tier polls, discussions and petitions
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      )}

      {/* Weekly Poll */}
      <SectionLabel icon="vote-outline" label="This Week's Poll" color={theme.colors.primary} />
      <QuerySection label="" query={weeklyPollQuery}>
        {(poll) => {
          const userTier = user?.verification_tier ?? 0;
          const state = getPollAccessState(userTier, poll);
          return (
            <WeeklyEngagementCard
              data={mapPollToWeekly(poll)}
              state={state}
              onPress={() => {
                if (state === "available" || state === "in_progress") openWeeklyPoll(poll);
              }}
              onViewAnalytics={() =>
                navigation.navigate("Polls", {
                  screen: "PollGroupAnalytics",
                  params: { groupId: poll.id },
                })
              }
            />
          );
        }}
      </QuerySection>

      {/* Weekly Discussion */}
      <SectionLabel icon="comment-text-outline" label="Featured Discussion" color={theme.colors.primary} />
      <QuerySection label="" query={weeklyDiscussionQuery}>
        {(discussion) => (
          <WeeklyEngagementCard
            data={mapDiscussionToWeekly(discussion)}
            onPress={() => openWeeklyDiscussion(discussion)}
          />
        )}
      </QuerySection>

      {/* Weekly Petition */}
      <SectionLabel icon="file-sign" label="Active Petition" color={theme.colors.primary} />
      <QuerySection label="" query={weeklyPetitionQuery}>
        {(petition) => (
          <WeeklyEngagementCard
            data={mapPetitionToWeekly(petition)}
            onPress={() => openWeeklyPetition(petition)}
            onViewAnalytics={() =>
              navigation.navigate("Petitions", {
                screen: "PetitionAnalyticsDetail",
                params: { petitionId: petition.id, title: petition.title },
              })
            }
          />
        )}
      </QuerySection>

    </Screen>
  );
}

/* -------------------------------------------------
   Section Label
--------------------------------------------------*/

function SectionLabel({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <View style={styles.sectionLabel}>
      <View style={[styles.sectionIconWrap, { backgroundColor: color + "20" }]}>
        <MaterialCommunityIcons name={icon} size={15} color={color} />
      </View>
      <Text style={[styles.sectionLabelText, { color }]}>{label}</Text>
    </View>
  );
}

/* -------------------------------------------------
   Styles
--------------------------------------------------*/

const styles = StyleSheet.create({
  nudge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 4,
  },
  nudgeText: {
    flex: 1,
    gap: 2,
  },
  nudgeTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  nudgeSub: {
    fontSize: 12,
  },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
    marginBottom: -2,
    paddingHorizontal: 4,
  },
  sectionIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabelText: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
