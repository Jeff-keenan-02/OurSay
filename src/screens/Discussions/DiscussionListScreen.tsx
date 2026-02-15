import React, { useCallback, useContext } from "react";
import { FlatList, Alert } from "react-native";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { Text, useTheme } from "react-native-paper";

import { AuthContext } from "../../context/AuthContext";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { BackRow } from "../../components/common/BackRow";
import TrendingEngagementCard from "../../components/common/TrendingEngagementCard";

import { useDiscussionByTopic } from "../../hooks/discussions/useDiscussionByTopic";
import { useDiscussionVote } from "../../hooks/discussions/useDiscussionVote";

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

  const route = useRoute<RouteProp<DiscussionStackParams, "DiscussionsList">>();

  const { topicId, title } = route.params;

  /* -------------------------------------------------
     Queries
  --------------------------------------------------*/

  const topicDiscussionsQuery = useDiscussionByTopic(topicId);

  /* -------------------------------------------------
     Derived UI Data (Mapping)
  --------------------------------------------------*/

  const discussionCards = topicDiscussionsQuery.data?.map(mapDiscussionToTrending) ?? [];

  /* -------------------------------------------------
     Mutations
  --------------------------------------------------*/

  const { vote } = useDiscussionVote(
    user,
    topicDiscussionsQuery.updateData
  );

  /* -------------------------------------------------
     Navigation
  --------------------------------------------------*/

  const openDiscussion = (id: number) => {
    navigation.navigate("DiscussionDetail", { id });
  };

  const handleVote = (
    id: number,
    direction: "up" | "down"
  ) => {
    if (!user) {
      return Alert.alert("You must be logged in to vote");
    }

    vote(id, direction);
  };

  /* -------------------------------------------------
     Refresh on Focus
  --------------------------------------------------*/

  useFocusEffect(
    useCallback(() => {
      topicDiscussionsQuery.reload();
    }, [topicDiscussionsQuery.reload])
  );

  /* -------------------------------------------------
     Render
  --------------------------------------------------*/

  return (
    <>
      <BackRow />

      <Screen
        scroll
        title={title}
        subtitle="See what people are saying in this topic."
      >
        {/* --------------- List of Disscusions  ------------ */}
        <Section>
          {topicDiscussionsQuery.loading ? (
            <Text
              style={{
                color: theme.colors.onSurfaceVariant,
                textAlign: "center",
              }}
            >
              Loading discussions…
            </Text>
          ) : discussionCards.length === 0 ? (
            <Text
              style={{
                color: theme.colors.onSurfaceVariant,
                textAlign: "center",
              }}
            >
              No discussions yet.
            </Text>
          ) : (
            <FlatList
              data={discussionCards}
              keyExtractor={(item) =>
                item.id.toString()
              }
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TrendingEngagementCard
                  data={item}
                  onPress={() =>
                    openDiscussion(item.id)
                  }
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