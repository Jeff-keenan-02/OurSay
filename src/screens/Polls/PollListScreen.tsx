import React, { useCallback, useContext } from "react";
import { FlatList } from "react-native";
import { Text } from "react-native-paper";
import { useNavigation, useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { BackRow } from "../../components/common/BackRow";
import { AuthContext } from "../../context/AuthContext";
import { usePollGroups } from "../../hooks/polls/usePollGroups";
import PollGroupCard from "../../components/PollTopics/PollGroupCard";
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


  const { groups, loadGroups, loading } = usePollGroups(user, topicId);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      loadGroups();
    }, [user])
  );

  const openGroup = (group: PollGroup) => {
    navigation.navigate("SwipePoll", {
      groupId: group.id,
      title: group.title,
    });
  };

    return (
    <>
      <BackRow />

      <Screen scroll title={title}>
        <Section label="Poll Groups">
          {loading ? (
            <Text>Loading...</Text>
          ) : (
            <FlatList
              data={groups}
              scrollEnabled={false}
              keyExtractor={(item) => item.id.toString()}
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