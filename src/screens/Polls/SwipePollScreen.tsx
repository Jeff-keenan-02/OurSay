// screens/Polls/SwipePollScreen.tsx

import React, { useEffect, useState, useContext, useCallback, useMemo, useRef } from "react";
import { View, StyleSheet, Text as RNText } from "react-native";
import { ProgressBar, Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useRoute, useNavigation } from "@react-navigation/native";

import { AuthContext } from "../../context/AuthContext";
import { usePollQuestions } from "../../hooks/polls/usePollQuestions";
import { usePollVote } from "../../hooks/polls/usePollVote";

import SwipeDeck from "../../components/SwipeDeck/SwipeDeck";
import { BackRow } from "../../components/common/BackRow";
import { getProgressColor } from "../../utils/progressColor";

type RouteParams = {
  groupId: number;
  title: string;
};

export default function SwipePollScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  useContext(AuthContext);

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
  const [isComplete, setIsComplete] = useState(false);
  const completionFired = useRef(false);

  /* -------------------------------------------------
     Derived Values
  --------------------------------------------------*/

  const totalPolls = pollQuery.data?.length ?? 0;

  const answeredCount = useMemo(() => {
    return pollQuery.data?.filter(p => p.has_voted).length ?? 0;
  }, [pollQuery.data]);

  const progressValue = totalPolls > 0 ? answeredCount / totalPolls : 0;
  const currentProgressLabel = `${answeredCount} / ${totalPolls} questions`;

  /* -------------------------------------------------
     Handlers
  --------------------------------------------------*/

  const handleSwipe = useCallback(
    (index: number, choice: "yes" | "no") => {
      const poll = pollQuery.data?.[index];
      if (!poll) return;

      setUiIndex(index + 1);

      voteMutation.vote(poll.id, choice).then((success) => {
        if (success) pollQuery.reload();
      });
    },
    [pollQuery.data, pollQuery.reload, voteMutation]
  );

  // Show completion overlay then navigate back
  useEffect(() => {
    if (!pollQuery.data || pollQuery.data.length === 0) return;
    if (uiIndex >= totalPolls && !completionFired.current) {
      completionFired.current = true;
      setIsComplete(true);
      setTimeout(() => navigation.pop(), 2200);
    }
  }, [uiIndex, totalPolls, pollQuery.data]);

  /* -------------------------------------------------
   Auto Position To First Unanswered Poll
  --------------------------------------------------*/

  useEffect(() => {
    if (!pollQuery.data || pollQuery.data.length === 0) return;

    const firstUnansweredIndex = pollQuery.data.findIndex(p => !p.has_voted);

    if (firstUnansweredIndex === -1) {
      setUiIndex(totalPolls);
      return;
    }

    setUiIndex(firstUnansweredIndex);
  }, [pollQuery.data]);

  /* -------------------------------------------------
     Render
  --------------------------------------------------*/

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

  if (pollQuery.error) {
    return (
      <>
        <BackRow />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>{pollQuery.error}</Text>
        </View>
      </>
    );
  }

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

      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* ---------- Header ---------- */}
        <View style={styles.headerBox}>
          <Text style={styles.headerLabel}>You are voting on:</Text>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>

        {/* ---------- Progress ---------- */}
        <ProgressBar
          progress={progressValue}
          color={getProgressColor(progressValue, progressValue >= 1)}
          style={styles.topProgress}
        />
        <Text style={styles.progressLabel}>{currentProgressLabel}</Text>

        {/* ---------- Swipe Deck ---------- */}
        <SwipeDeck
          disabled={voteMutation.loading}
          cards={pollQuery.data ?? []}
          currentIndex={uiIndex}
          onSwipeYes={(i) => handleSwipe(i, "yes")}
          onSwipeNo={(i) => handleSwipe(i, "no")}
          onSwipeAllDone={() => {}}
        />
      </View>

      {/* Completion overlay */}
      {isComplete && (
        <View style={styles.overlay}>
          <MaterialCommunityIcons name="check-circle" size={80} color="#4ade80" />
          <RNText style={styles.completeTitle}>Poll Complete!</RNText>
          <RNText style={styles.completeSubtitle}>{title}</RNText>
          <ProgressBar progress={1} color="#4ade80" style={styles.completeProgress} />
        </View>
      )}
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
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    zIndex: 99,
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#4ade80",
  },
  completeSubtitle: {
    fontSize: 17,
    color: "#ffffff",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  completeProgress: {
    width: 200,
    height: 6,
    borderRadius: 4,
    marginTop: 8,
  },
});
