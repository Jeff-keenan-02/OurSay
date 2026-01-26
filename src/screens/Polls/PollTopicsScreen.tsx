import React, { useContext, useCallback } from "react";
import { FlatList, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import WeeklyPollCard from "../../components/PollTopics/WeeklyPollCard";
import TopicCard from "../../components/PollTopics/TopicCard";
import { useWeeklyPoll } from "../../hooks/polls/useWeeklyPoll";
import { usePollTopics } from "../../hooks/polls/usePollTopics";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { PollTopic } from "../../types/PollTopic";


export default function PollTopicsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);
  const API = "http://localhost:3000";

  const { topics, loadTopics } = usePollTopics(API, user);
  const { weeklyPoll, loadWeeklyPoll } = useWeeklyPoll(API, user);

  // Reload data when screen focuses
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      loadTopics();
      loadWeeklyPoll();
    }, [user])
  );

  const openTopic = (topic: PollTopic) => {
    navigation.navigate("Polls", {
      screen: "SwipePoll",
      params: {
        topicId: topic.id,
        title: topic.title,
      },
    });
  };

  return (
    <Screen
      scroll
   
    >
      {/* FEATURED WEEKLY POLL */}
      <Section label="Featured this week">
        {weeklyPoll ? (
          <WeeklyPollCard poll={weeklyPoll} onPress={() => openTopic(weeklyPoll)} />
        ) : (
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Loading weekly poll...</Text>
        )}
      </Section>

      {/* ALL POLL TOPICS */}
      <Section label="Topics">

        <FlatList
          data={topics.filter((t) => !t.is_weekly)}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TopicCard topic={item} onPress={() => openTopic(item)} />
          )}
        />
      </Section>
    </Screen>
  );
}