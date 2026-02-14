import React, { useContext, useCallback } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import { useWeeklyPoll } from "../../hooks/polls/useWeeklyPoll";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { WeeklyEngagementCard } from "../../components/common/WeeklyEngagementCard";
import { TopicCard } from "../../components/common/TopicCard";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Topic } from "../../types/Topic";
import { useTopics } from "../../hooks/common/useTopics";
import { mapWeeklyPollToCard } from "../../mappers/weeklyCardMapper";
import { useTrendingPoll } from "../../hooks/polls/useTrendingPoll";
import TrendingEngagementCard from "../../components/common/TrendingEngagementCard";


const stack = createNativeStackNavigator();

export default function PollHomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);

  const {weeklyPoll, loading: pollLoading, reload: reloadWeeklyPoll} = useWeeklyPoll(user);

  const weeklyPollUI = weeklyPoll ? mapWeeklyPollToCard(weeklyPoll): null;


   // hook for trending Poll
const { polls: trendingPolls, loading: trendingLoading } = useTrendingPoll();

  // hook for topics
  const { topics, loading: topicsLoading, } = useTopics();
    

const openPollGroup = (groupId: number, title: string) => {
  navigation.navigate("SwipePoll", {
    groupId,
    title,
  });
};

const openTopic = (topic: Topic) => {
  navigation.navigate("PollList", {
    topicId: topic.id,
    title: topic.title,
  });
};
  // Reload data when screen focuses
 useFocusEffect(
  useCallback(() => {
    reloadWeeklyPoll();
  }, [reloadWeeklyPoll])
);

  return (
    <Screen scroll>
      {/* FEATURED WEEKLY POLL */}
         <Section label="Featured This Week">
            {pollLoading ? (
              <Text variant="bodyMedium">
                Loading…
              </Text>
            ) : weeklyPollUI ? (
              <WeeklyEngagementCard
                data={weeklyPollUI}
                onPress={() => openPollGroup(weeklyPollUI.id, weeklyPollUI.title)}
              />
            ) : null}
          </Section>


        {/* 🔥 Trending Poll */}
        <Section label="Trending Polls">
          {trendingLoading ? (
            <Text>Loading…</Text>
          ) : trendingPolls.length === 0 ? (
            <Text>No trending polls yet.</Text>
          ) : (
            <FlatList
              data={trendingPolls}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingRight: 16 }}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TrendingEngagementCard
                  data={item}
                  onPress={() => openPollGroup(item.id, item.title)}
                />
              )}
            />
          )}
        </Section>

      {/* topics Section */}
         <Section label="Browse by topic">
           {topicsLoading ? (
             <Text>Loading topics…</Text>
           ) : (
             <FlatList
               data={topics}
               scrollEnabled={false}
               keyExtractor={(item) => item.id.toString()}
               contentContainerStyle={{ gap: 12 }}
               renderItem={({ item }) => (
                 <TopicCard
                   title={item.title}
                   description={item.description}
                   icon="dots-grid"
                   onPress={() => openTopic(item)}
                 />
               )}
             />
           )}
         </Section>
       </Screen>
     );
   }
   
   const styles = StyleSheet.create({
     TopicCard: {
       padding: 16,
       borderRadius: 14,
     },
     TopicTitle: {
       fontSize: 18,
       fontWeight: "600",
     },
     TopicDescription: {
       fontSize: 14,
       marginTop: 4,
     },
   });