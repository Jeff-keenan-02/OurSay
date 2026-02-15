import React, { useCallback } from "react";
import { FlatList } from "react-native";
import { Text, Divider } from "react-native-paper";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { BackRow } from "../../components/common/BackRow";
import TrendingEngagementCard from "../../components/common/TrendingEngagementCard";

import { usePetitionsByTopic } from "../../hooks/petitions/usePetitionsByTopic";
import { mapPetitionToTrending } from "../../mappers/trendingCardMapper";

type RouteParams = {
  topicId: number;
  title: string;
};



export default function PetitionListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { topicId, title } = route.params as RouteParams;

  /* -------------------------------------------------
     Query
  --------------------------------------------------*/

  const petitionsQuery = usePetitionsByTopic(topicId);

  /* -------------------------------------------------
     Refresh on Focus
  --------------------------------------------------*/

  useFocusEffect(
    useCallback(() => {
      petitionsQuery.reload();
    }, [petitionsQuery.reload])
  );

  /* -------------------------------------------------
     Derived UI Data (Mapping)
  --------------------------------------------------*/

  const petitionCards = petitionsQuery.data?.map(mapPetitionToTrending) ?? [];

  /* -------------------------------------------------
     Navigation
  --------------------------------------------------*/

  const openPetition = (id: number) => {
    navigation.navigate("PetitionDetail", {
      petitionId: id,
    });
  };

  /* -------------------------------------------------
     Render
  --------------------------------------------------*/

  return (
    <>
      <BackRow />

      <Screen title={title}>
        <Section label="Active Petitions">
          {petitionsQuery.loading ? (
            <Text>Loading…</Text>
          ) : petitionsQuery.error ? (
            <Text>{petitionsQuery.error}</Text>
          ) : (
            <FlatList
              data={petitionCards}
              keyExtractor={(item) =>
                item.id.toString()
              }
              ItemSeparatorComponent={() => (
                <Divider />
              )}
              renderItem={({ item }) => (
                <TrendingEngagementCard
                  data={item}
                  onPress={() =>
                    openPetition(item.id)
                  }
                />
              )}
            />
          )}
        </Section>
      </Screen>
    </>
  );
}