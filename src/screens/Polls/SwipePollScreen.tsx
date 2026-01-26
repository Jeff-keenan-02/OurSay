// screens/Polls/SwipePollScreen.tsx
import React, { useEffect, useState, useContext } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { ProgressBar, Text, useTheme } from "react-native-paper";
import { AuthContext } from "../../context/AuthContext";
import SwipeDeck from "../../components/SwipeDeck/SwipeDeck";

import { usePollQuestions } from "../../hooks/polls/usePollQuestions";
import { usePollVote } from "../../hooks/polls/usePollVote";
import { usePollProgress } from "../../hooks/polls/usePollProgress";

export default function SwipePollScreen({ route, navigation }: any) {
  const { topicId, title } = route.params;
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const API = "http://localhost:3000";

  const { polls } = usePollQuestions(API, topicId);

  // authoritative backend progress
  const { status, index: backendIndex } = usePollProgress(API, topicId, user, polls, navigation);

  // local UI index
  const [uiIndex, setUiIndex] = useState(0);

  // sync UI once backend index is known
  useEffect(() => {
    setUiIndex(backendIndex);
  }, [backendIndex]);

  const { vote } = usePollVote(API, topicId, user);

  useEffect(() => {
    if (status === 2) {
      Alert.alert(
        "You have already completed this poll.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  }, [status]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.headerBox}>
        <Text style={styles.headerLabel}>You are voting on:</Text>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <ProgressBar
        progress={polls.length ? uiIndex / polls.length : 0}
        color="#4caf50"
        style={styles.topProgress}
      />

      <Text style={styles.progressLabel}>
        {Math.min(uiIndex, polls.length)} / {polls.length} questions
      </Text>

      <SwipeDeck
        cards={polls}
        currentIndex={uiIndex}
        onSwipeYes={(i) => {
          const poll = polls[i];
          if (!poll) return;

          vote(poll.id, "yes");   // backend
          setUiIndex(i + 1);      // ✅ UI moves immediately
        }}
        onSwipeNo={(i) => {
          const poll = polls[i];
          if (!poll) return;

          vote(poll.id, "no");
          setUiIndex(i + 1);
        }}
        onSwipeAllDone={() => navigation.goBack()}
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