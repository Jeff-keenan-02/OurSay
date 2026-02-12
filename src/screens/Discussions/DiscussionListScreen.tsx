import React, { useCallback, useContext } from "react";
import { View, FlatList, Alert } from "react-native";
import { RouteProp, useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { Text, useTheme } from "react-native-paper";
import { AuthContext } from "../../context/AuthContext";
import { useDiscussionVote } from "../../hooks/discussions/useDiscussionVote";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { useDiscussionByTopic } from "../../hooks/discussions/useDiscussionByTopic";
import { BackRow } from "../../components/common/BackRow";
import { useTrendingDiscussions } from "../../hooks/discussions/useTrendingDiscussions";
import TrendingEngagementCard from "../../components/common/TrendingEngagementCard";
import { mapDiscussionToTrending } from "../../mappers/trendingCardMapper";

type DiscussionStackParams = {
  DiscussionHome: undefined;
  DiscussionsList: { topicId: number; title: string };
  DiscussionDetail: { id: number; title: string };
};

export default function DiscussionsListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);


  // ✅ Strongly-typed route params
  const route = useRoute<RouteProp<DiscussionStackParams, "DiscussionsList">>();
  const { topicId, title } = route.params;

  // ✅ Load only discussions from this topic
  const { discussions, loading, loadDiscussions, setDiscussions } = useDiscussionByTopic(topicId);

  const { vote } = useDiscussionVote(user, setDiscussions);

  const openDiscussion = (id: number) => {
    navigation.navigate("DiscussionDetail", { id });
  };

  const handleVote = (id: number, direction: "up" | "down") => {
    if (!user) return Alert.alert("You must be logged in to vote");
    vote(id, direction);
  };
  // ⬅️ when screen comes back into focus, reload discussions
  useFocusEffect(
    useCallback(() => {
    loadDiscussions(); 
    }, [loadDiscussions])
  );

  return (
<>     
<BackRow/>
    <Screen

      scroll
      title={title}
      subtitle="See what people are saying in this topic."
    >
      <Section>
        {loading ? (
          <Text
            style={{
              color: theme.colors.onSurfaceVariant,
              textAlign: "center",
              marginTop: 0,
            }}
          >
            Loading discussions…
          </Text>
        ) : (
          <FlatList<any>
            data={discussions}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TrendingEngagementCard
                data={mapDiscussionToTrending(item)}
                onPress={() => openDiscussion(item.id)}
                onVote={handleVote}
              />
            )}
          />
        )}
      </Section>
    </Screen>
    </>
    );
}