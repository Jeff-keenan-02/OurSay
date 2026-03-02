import React, { useCallback } from "react";
import { Divider, Text } from "react-native-paper";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
  RouteProp,
} from "@react-navigation/native";
import { Screen } from "../../layout/Screen";
import { QuerySection } from "../../components/common/QuerySection";
import { VerticalList } from "../../components/common/VerticalList";
import TrendingEngagementCard from "../../components/common/TrendingEngagementCard";
import { usePetitionsByTopic } from "../../hooks/petitions/usePetitionsByTopic";
import { mapPetitionToTrending } from "../../mappers/trendingCardMapper";

type RouteParams = {
  PetitionList: {
    topicId: number;
    title: string;
  };
};

export default function PetitionListScreen() {
  const navigation = useNavigation<any>();
  const route =
    useRoute<RouteProp<RouteParams, "PetitionList">>();

  const { topicId, title } = route.params;

  /* -------------------------------------------------
     Query
  --------------------------------------------------*/

  const petitionsQuery =
    usePetitionsByTopic(topicId);

  /* -------------------------------------------------
     Refresh on Focus
  --------------------------------------------------*/

  useFocusEffect(
    useCallback(() => {
      petitionsQuery.reload();
    }, [petitionsQuery.reload])
  );

  /* -------------------------------------------------
     Navigation
  --------------------------------------------------*/

  const openPetition = (petitionId: number) => {
    navigation.navigate("PetitionDetail", {
      petitionId,
    });
  };

  /* -------------------------------------------------
     Render
  --------------------------------------------------*/

  return (
      <Screen title={title} scroll showBack>

        {/* --------------- Petition List --------------- */}
        <QuerySection
          label="Active Petitions"
          query={petitionsQuery}
        >
          {(data) => {
            if (data.length === 0) {
              return (
                <Text style={{ textAlign: "center" }}>
                  No petitions in this topic yet.
                </Text>
              );
            }

            return (
              <VerticalList
                data={data.map(mapPetitionToTrending)}
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
            );
          }}
        </QuerySection>

      </Screen>

  );
}