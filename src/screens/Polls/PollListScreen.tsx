import React, { useCallback, useContext } from "react";
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";

import { Screen } from "../../layout/Screen";
import { BackRow } from "../../components/common/BackRow";
import { QuerySection } from "../../components/common/QuerySection";
import { VerticalList } from "../../components/common/VerticalList";
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
     Query
  --------------------------------------------------*/

  const pollGroupQuery = usePollGroups(user, topicId);

  /* -------------------------------------------------
     Navigation
  --------------------------------------------------*/

  const openGroup = (group: PollGroup) => {
    navigation.navigate("SwipePoll", {
      groupId: group.id,
      title: group.title,
    });
  };

  /* -------------------------------------------------
     Refresh on Focus
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
      <Screen scroll title={title} showBack>
        <QuerySection
          label="Poll Groups"
          query={pollGroupQuery}
        >
          {(data) => (
            <VerticalList
              data={data}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <PollGroupCard
                  group={item}
                  onPress={() => openGroup(item)}
                />
              )}
            />
          )}
        </QuerySection>
      </Screen>
  );
}