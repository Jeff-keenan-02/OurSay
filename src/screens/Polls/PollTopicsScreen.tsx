// import React, { useContext, useCallback } from "react";
// import { View, StyleSheet, FlatList } from "react-native";
// import { Text, useTheme, Divider } from "react-native-paper";
// import { useNavigation, useFocusEffect } from "@react-navigation/native";

// import { AuthContext } from "../../context/AuthContext";
// import WeeklyPollCard from "../../components/PollTopics/WeeklyPollCard";
// import TopicCard from "../../components/PollTopics/TopicCard";

// import { useWeeklyPoll } from "../../hooks/useWeeklyPoll";
// import { spacing } from "../../theme/spacing";
// import { typography } from "../../theme/typography";
// import { globalStyles } from "../../theme/globalStyles";

// import { PollTopic } from "../../types/Poll";
// import { usePollTopics } from "../../hooks/usePollTopics";

// export default function PollTopicsScreen({ navigation }: any) {
//   const theme = useTheme();
//   const { user } = useContext(AuthContext);
//   const API = "http://localhost:3000";
  

//   // Load topics with new hook
//   const { topics,  loadTopics } = usePollTopics(API, user);

//   // Load weekly poll with your existing hook
//   const { weeklyPoll, loadWeeklyPoll } = useWeeklyPoll(API, user);


//   // Reload everything on screen focus
//   useFocusEffect(
//     useCallback(() => {
//       if (!user) return;
//       loadTopics();
//       loadWeeklyPoll();
//     }, [user])
//   );

//   const renderTopic = ({ item }: { item: PollTopic }) => (
//     <TopicCard
//       topic={item}
//       onPress={() =>
//         navigation.navigate("Polls", {
//           screen: "SwipePoll",
//           params: { topicId: item.id, title: item.title },
//         })
//       }
//     />
//   );

//   return (
//     <FlatList
//       style={{ backgroundColor: theme.colors.background }}
//       contentContainerStyle={{ paddingBottom: spacing.xl }}
//       data={topics.filter((t) => !t.is_weekly)}
//       keyExtractor={(item) => item.id.toString()}
//       renderItem={renderTopic}
//       ListHeaderComponent={
//         <View style={globalStyles.screen}>
//            {/* PAGE TITLE */}
//           <Text
//             style={[
//               typography.screenTitle,
//               { color: theme.colors.onBackground, textAlign: "center" }
//             ]}
//           >
//             Weekly Poll
//           </Text>

//           <Text
//             style={[
//               typography.body,
//               {
//                 color: theme.colors.onSurfaceVariant,
//                 textAlign: "center",
//                 marginBottom: spacing.md,
//               },
//             ]}
//           >
//             Participate in weekly public polls and explore topics that matter.
//           </Text>
//           {/* WEEKLY POLL */}
//           <View style={{ marginTop: spacing.md }}>
//             <Text
//               style={[
//                 styles.sectionLabel,
//                 { color: theme.colors.primary }
//               ]}
//             >
//               Featured this week
//             </Text>

//             {weeklyPoll ? (
//               <WeeklyPollCard
//                 poll={weeklyPoll}
//                 onPress={() =>
//                   navigation.navigate("Polls", {
//                     screen: "SwipePoll",
//                     params: {
//                       topicId: weeklyPoll.id,
//                       title: weeklyPoll.title,
//                     },
//                   })
//                 }
//               />
//             ) : (
//               <Text style={{ color: theme.colors.onSurfaceVariant }}>
//                 Loading weekly poll...
//               </Text>
//             )}
            
//           </View>

//           <Divider style={{ marginVertical: spacing.md, opacity: 0.15 }} />
//            {/* PAGE TITLE */}
//           <Text
//             style={[
//               typography.screenTitle,
//               { color: theme.colors.onBackground, textAlign: "center" }
//             ]}
//           >
//             Topics
//           </Text>

//           <Text
//             style={[
//               typography.body,
//               {
//                 color: theme.colors.onSurfaceVariant,
//                 textAlign: "center",
//                 marginBottom: spacing.md,
//               },
//             ]}
//           >
//             View topics and vote on polls that matter to you!
//           </Text>

//           {/* TOPICS LABEL */}
//           <Text
//             style={[
//               typography.subtitle,
//               { color: theme.colors.onBackground, marginBottom: spacing.sm }
//             ]}
//           >
//             All Poll Topics
//           </Text>
//         </View>
//       }
//     />
//   );
// }
// const styles = StyleSheet.create({
//   sectionLabel: {
//     paddingHorizontal: spacing.md,
//     marginBottom: spacing.sm,
//     textTransform: "uppercase",
//     fontWeight: "600",
//     letterSpacing: 1,
//   },
// });
import React, { useContext, useCallback } from "react";
import { FlatList, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { AuthContext } from "../../context/AuthContext";
import WeeklyPollCard from "../../components/PollTopics/WeeklyPollCard";
import TopicCard from "../../components/PollTopics/TopicCard";

import { useWeeklyPoll } from "../../hooks/useWeeklyPoll";
import { usePollTopics } from "../../hooks/usePollTopics";

import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { PollTopic } from "../../types/Poll";

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
      title="Weekly Poll"
      subtitle="Participate in weekly polls and explore topics that matter."
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
        <Text
          style={[
            typography.subtitle,
            {
              color: theme.colors.onSurfaceVariant,
              marginBottom: spacing.sm,
            },
          ]}
        >
          View topics and vote on polls that matter to you.
        </Text>

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