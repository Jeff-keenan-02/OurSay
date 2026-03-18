import React, { useCallback, useContext } from "react";
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import { Screen } from "../../layout/Screen";
import { QuerySection } from "../../components/common/QuerySection";
import { VerticalList } from "../../components/common/VerticalList";
import PollGroupCard from "../../components/PollTopics/PollGroupCard";
import { AuthContext } from "../../context/AuthContext";
import { usePollGroups } from "../../hooks/polls/usePollGroups";
import { PollGroup } from "../../types/PollGroup";
import { permissions } from "../../utils/permissions";
import { VerificationTier } from "../../types/verification";
import { getPollAccessState } from "../../utils/pollAccess";




type PollStackParams = {
  PollTopics: undefined;
  PollGroups: { topicId: number; title: string };
  SwipePoll: { groupId: number; title: string };
};

export default function PollListScreen() {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);

  const route =
    useRoute<RouteProp<PollStackParams, "PollGroups">>();
  const { topicId, title } = route.params;

  /* -------------------------------------------------
     Query
     (Fetch poll groups for this topic)
  --------------------------------------------------*/

  const pollGroupQuery = usePollGroups(topicId);

  /* -------------------------------------------------
     Navigation
     (Navigate to poll group if allowed)
  --------------------------------------------------*/

  const openGroup = (group: PollGroup) => {
    navigation.navigate("SwipePoll", {
      groupId: group.id,
      title: group.title,
    });
  };

  /* -------------------------------------------------
     Refresh on Focus
     (Keeps data fresh when returning)
  --------------------------------------------------*/

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      pollGroupQuery.reload();
    }, [user, pollGroupQuery.reload])
  );

  /* -------------------------------------------------
     Render
  -------------------------------------------------*/
  return (
  
   <Screen scroll title={title} showBack>
      <QuerySection
        label="Poll Groups"
        query={pollGroupQuery}
      >
        {(groups) => (
          <VerticalList
            data={groups}
            keyExtractor={(item) =>
              item.id.toString()
            }
            renderItem={({ item }) => {
              /* ----------------------------------
                 Access Control
              ---------------------------------- */
              const userTier = user?.verification_tier ?? 0;
              const state = getPollAccessState(userTier, item);


              /* ----------------------------------
                 Final Card State
              ---------------------------------- */
              return (
                <PollGroupCard
                  group={item}
                  state={state}
                  onPress={() => {
                    if (state === "available" || state === "in_progress") {
                      openGroup(item);
                    }
                  }}
                />
              );
            }}  
          />
        )}
      </QuerySection>
    </Screen>
  );
}