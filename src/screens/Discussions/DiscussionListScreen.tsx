import React, { useCallback, useContext } from "react";
import { FlatList, Alert } from "react-native";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { Text } from "react-native-paper";

import { AuthContext } from "../../context/AuthContext";
import { Screen } from "../../layout/Screen";
import { BackRow } from "../../components/common/BackRow";
import TrendingEngagementCard from "../../components/common/TrendingEngagementCard";


import { useDiscussionByTopic } from "../../hooks/discussions/useDiscussionByTopic";
import { useDiscussionVote } from "../../hooks/discussions/useDiscussionVote";

import { mapDiscussionToTrending } from "../../mappers/trendingCardMapper";
import { DiscussionListItem } from "../../types/Discussion";

import { QuerySection } from "../../components/common/QuerySection";
type DiscussionStackParams = {
  DiscussionHome: undefined;
  DiscussionsList: { topicId: number; title: string };
  DiscussionDetail: { id: number; title: string };
};

export default function DiscussionsListScreen() {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);

  const route =
    useRoute<RouteProp<DiscussionStackParams, "DiscussionsList">>();

  const { topicId, title } = route.params;

  /* -------------------------------------------------
     Queries
  --------------------------------------------------*/

  const topicDiscussionsQuery =
    useDiscussionByTopic(topicId);

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
      return Alert.alert(
        "You must be logged in to vote"
      );
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
      <Screen
        scroll
        showBack
        title={title}
        subtitle="See what people are saying in this topic."
      >
        {/* ---------------------------------------------
           Discussions Query Section
           Handles loading + error automatically
        ---------------------------------------------- */}

        <QuerySection
          label="Discussions"
          query={topicDiscussionsQuery}
        >
          {(data: DiscussionListItem[]) => {
            const discussionCards =
              data.map(mapDiscussionToTrending);

            if (discussionCards.length === 0) {
              return (
                <Text style={{ textAlign: "center" }}>
                  No discussions yet.
                </Text>
              );
            }

            return (
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
            );
          }}
        </QuerySection>
      </Screen>
  );
}