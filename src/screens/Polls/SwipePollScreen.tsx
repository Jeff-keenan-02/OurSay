// screens/Polls/SwipePollScreen.tsx

import React, { useEffect, useState, useContext, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { ProgressBar, Text, useTheme } from "react-native-paper";
import { useRoute, useNavigation } from "@react-navigation/native";

import { AuthContext } from "../../context/AuthContext";
import { usePollQuestions } from "../../hooks/polls/usePollQuestions";
import { usePollVote } from "../../hooks/polls/usePollVote";
import { usePollProgress } from "../../hooks/polls/usePollProgress";

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
  const progressQuery = usePollProgress(groupId, user);

  /* -------------------------------------------------
     Mutations
  --------------------------------------------------*/

  const voteMutation = usePollVote(user);

  /* -------------------------------------------------
     Local UI State
  --------------------------------------------------*/

  const [uiIndex, setUiIndex] = useState(0);

  /* -------------------------------------------------
     Sync Backend Progress → UI
     (Backend is authoritative)
  --------------------------------------------------*/

  useEffect(() => {
    setUiIndex(progressQuery.data?.index ?? 0);
  }, [progressQuery.data?.index]);

  /* -------------------------------------------------
     Derived Values
  --------------------------------------------------*/

  const totalPolls = pollQuery.data?.length ?? 0;

  const progressValue =
    totalPolls > 0 ? uiIndex / totalPolls : 0;

  const currentProgressLabel = `${Math.min(
    uiIndex,
    totalPolls
  )} / ${totalPolls} questions`;

  /* -------------------------------------------------
     Handlers
  --------------------------------------------------*/

  const handleSwipe = useCallback(
    async (index: number, choice: "yes" | "no") => {
      const poll = pollQuery.data?.[index];
      if (!poll) return;

      // 1️⃣ Optimistic UI update
      setUiIndex(index + 1);

      // 2️⃣ Send vote to backend
      await voteMutation.vote(poll.id, choice);

      // 3️⃣ Optionally refresh backend progress
      progressQuery.reload();
    },
    [
      pollQuery.data,
      voteMutation,
      progressQuery.reload,
    ]
  );

  /* -------------------------------------------------
     Render
  --------------------------------------------------*/

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