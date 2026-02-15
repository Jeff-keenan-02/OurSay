import React, { useCallback, useContext } from "react";
import { FlatList } from "react-native";
import { Text } from "react-native-paper";
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";

import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { BackRow } from "../../components/common/BackRow";
import PollGroupCard from "../../components/PollTopics/PollGroupCard";

import { AuthContext } from "../../context/AuthContext";
import { usePollGroups } from "../../hooks/polls/usePollGroups";

import { PollGroup } from "../../types/PollGroup";


type PollStackParams = {
  PollTopics: undefined;
  PollGroups: { topicId: number; title: string };
  SwipePoll: { groupId: number; title: string };
};

export default function PollListScreen() {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);

  

  const route = useRoute<RouteProp<PollStackParams, "PollGroups">>();
  const { topicId, title } = route.params;

  /* -------------------------------------------------
     Queries
  --------------------------------------------------*/

  const pollGroupQuery = usePollGroups(user, topicId);

  /* -------------------------------------------------
     Navigation Handlers
  --------------------------------------------------*/

  const openGroup = (group: PollGroup) => {
    navigation.navigate("SwipePoll", {
      groupId: group.id,
      title: group.title,
    });
  };

  /* -------------------------------------------------
     Refresh on Focus
     (Ensures updated progress when returning)
  --------------------------------------------------*/

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      pollGroupQuery.reload();
    }, [user, pollGroupQuery.reload])
  );

  /* -------------------------------------------------
     Render
  --------------------------------------------------*/

  return (
    <>
      <BackRow />

      {/* --------------- Poll Groups  ------------ */}
      <Screen scroll title={title}>
        <Section label="Poll Groups">
          {pollGroupQuery.loading ? (
            <Text>Loading…</Text>
          ) : (
            <FlatList
              data={pollGroupQuery.data ?? []}
              scrollEnabled={false}
              keyExtractor={(item) =>
                item.id.toString()
              }
              renderItem={({ item }) => (
                <PollGroupCard
                  group={item}
                  onPress={() => openGroup(item)}
                />
              )}
            />
          )}
        </Section>
      </Screen>
    </>
  );
}