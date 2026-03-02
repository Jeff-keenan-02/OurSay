// screens/Polls/SwipePollScreen.tsx

import React, { useEffect, useState, useContext, useCallback, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { ProgressBar, Text, useTheme } from "react-native-paper";
import { useRoute, useNavigation } from "@react-navigation/native";

import { AuthContext } from "../../context/AuthContext";
import { usePollQuestions } from "../../hooks/polls/usePollQuestions";
import { usePollVote } from "../../hooks/polls/usePollVote";


import SwipeDeck from "../../components/SwipeDeck/SwipeDeck";
import { BackRow } from "../../components/common/BackRow";



type RouteParams = {
  groupId: number;
  title: string;
};


export default function SwipePollScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);


  const route = useRoute<any>();
  const { groupId, title } = route.params as RouteParams;

  /* -------------------------------------------------
     Queries
  --------------------------------------------------*/

  const pollQuery = usePollQuestions(groupId);


  /* -------------------------------------------------
     Mutations
  --------------------------------------------------*/

  const voteMutation = usePollVote();

  /* -------------------------------------------------
     Local UI State
  --------------------------------------------------*/

  const [uiIndex, setUiIndex] = useState(0);

  /* -------------------------------------------------
     Derived Values
  --------------------------------------------------*/

    const totalPolls = pollQuery.data?.length ?? 0;

const answeredCount = useMemo(() => {
  return pollQuery.data?.filter(p => p.has_voted).length ?? 0;
}, [pollQuery.data]);

  const progressValue =
    totalPolls > 0 ? answeredCount / totalPolls : 0;

  const currentProgressLabel =
    `${answeredCount} / ${totalPolls} questions`;

  /* -------------------------------------------------
     Handlers
  --------------------------------------------------*/

  const handleSwipe = useCallback(
    async (index: number, choice: "yes" | "no") => {
      const poll = pollQuery.data?.[index];
      if (!poll) return;

      // 1. Optimistic UI update
      setUiIndex(index + 1);

      // 2. Send vote to backend
      const success = await voteMutation.vote(poll.id, choice);

      if (!success) {
        setUiIndex(index); // rollback optimistic update
        return;
      }
      await pollQuery.reload();


    },
    [
      pollQuery.data,
      pollQuery.reload,
      voteMutation,
    ]
  );

  /* -------------------------------------------------
   Auto Position To First Unanswered Poll
--------------------------------------------------*/

useEffect(() => {
  if (!pollQuery.data || pollQuery.data.length === 0) return;

  const firstUnansweredIndex =
    pollQuery.data.findIndex(p => !p.has_voted);

  if (firstUnansweredIndex === -1) {
    // All polls answered
    setUiIndex(totalPolls);
    return;
  }

  setUiIndex(firstUnansweredIndex);

}, [pollQuery.data]);

  /* -------------------------------------------------
     Render
  --------------------------------------------------*/

  
  {/*--------------Loading State------------------*/}
  if (pollQuery.loading) {
    return (
      <>
        <BackRow />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Loading polls…</Text>
        </View>
      </>
    );
  }

  {/*--------------Loading State------------------*/}
  if (pollQuery.error) {
    return (
      <>
        <BackRow />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>
            {pollQuery.error}
          </Text>
        </View>
      </>
    );
  }
  {/*--------------Check polls exist ------------------*/}
  if (!pollQuery.data || pollQuery.data.length === 0) {
  return (
    <>
      <BackRow />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No polls available.</Text>
      </View>
    </>
  );
}

  return (
    <>
    
      <BackRow />

      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
        }}
      >
        {/* ---------- Header ---------- */}

        <View style={styles.headerBox}>
          <Text style={styles.headerLabel}>
            You are voting on:
          </Text>
          <Text style={styles.headerTitle}>
            {title}
          </Text>
        </View>

        {/* ---------- Progress ---------- */}

        <ProgressBar
          progress={progressValue}
          color={theme.colors.primary}
          style={styles.topProgress}
        />

        <Text style={styles.progressLabel}>
          {currentProgressLabel}
        </Text>

        {/* ---------- Swipe Deck ---------- */}

        <SwipeDeck
          disabled={voteMutation.loading}
          cards={pollQuery.data ?? []}
          currentIndex={uiIndex}
          onSwipeYes={(i) =>
            handleSwipe(i, "yes")
          }
          onSwipeNo={(i) =>
            handleSwipe(i, "no")
          }
          onSwipeAllDone={() =>
            navigation.goBack()
          }
        />
      </View>
    </>
  );
}

/* =====================================================
   Styles
===================================================== */

const styles = StyleSheet.create({
  headerBox: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 5,
  },
  headerLabel: {
    fontSize: 14,
    color: "#bbb",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  topProgress: {
    height: 6,
    marginHorizontal: 20,
    borderRadius: 6,
    marginTop: 10,
  },
  progressLabel: {
    textAlign: "center",
    color: "#aaa",
    marginTop: 6,
  },
});