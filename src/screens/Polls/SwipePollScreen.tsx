// screens/Polls/SwipePollScreen.tsx
import React, { useEffect, useState, useContext } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { ProgressBar, Text, useTheme } from "react-native-paper";
import { AuthContext } from "../../context/AuthContext";
import SwipeDeck from "../../components/SwipeDeck/SwipeDeck";
import { usePollQuestions } from "../../hooks/usePollQuestions";
import { usePollProgress } from "../../hooks/usePollProgress";
import { usePollVote } from "../../hooks/usePollVote";

export default function SwipePollScreen({ route, navigation }: any) {
  const { topicId, title } = route.params;

  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const API = "http://localhost:3000";

// Load all poll questions for this topic
// - Fetches /polls-by-topic/:topicId
// - Returns an array of poll cards (yes/no questions)
const { polls } = usePollQuestions(API, topicId);


// Manage poll progress (status + current question index)
// - status = 0 (not started), 1 (in progress), 2 (completed)
// - index = the current poll card the user should be on
// - setIndex = update question index after a swipe
// - setStatus = update status (used by the vote hook)
const { status, index, setIndex, setStatus } = usePollProgress(API, topicId, user, polls, navigation);


// Handle voting logic
// - Saves user's vote (POST /polls/:id/vote)
// - Recalculates topic progress in DB (/poll-topic-progress/update)
// - Retrieves updated progress
// - Calls setIndex + setStatus to sync UI
const { vote } = usePollVote(API, topicId, user, setIndex, setStatus);



  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      
      {/* Header */}
      <View style={styles.headerBox}>
        <Text style={styles.headerLabel}>You are voting on:</Text>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      {/* Progress Bar */}
      <ProgressBar
        progress={polls.length ? index / polls.length : 0}
        color="#4caf50"
        style={styles.topProgress}
      />

      <Text style={styles.progressLabel}>
        {Math.min(index, polls.length)} / {polls.length} questions
      </Text>

      {/* Swipe Component */}
      <SwipeDeck
        cards={polls}
        currentIndex={index}
        onSwipeYes={(i: number) => {
          vote(polls[i].id, "yes");
          setIndex(i + 1);
        }}
        onSwipeNo={(i: number) => {
          vote(polls[i].id, "no");
          setIndex(i + 1);
        }}
        onSwipeAllDone={() => {
          setIndex(polls.length);
          setTimeout(() => navigation.goBack(), 400);
        }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  headerBox: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 5 },
  headerLabel: { fontSize: 14, color: "#bbb" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  topProgress: { height: 6, marginHorizontal: 20, borderRadius: 6, marginTop: 10 },
  progressLabel: { textAlign: "center", color: "#aaa", marginTop: 6 },
});