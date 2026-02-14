import React, { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { Text, Button, Divider, useTheme } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { API_BASE_URL } from "../../config/api";
import { BackRow } from "../../components/common/BackRow";
import TrendingEngagementCard from "../../components/common/TrendingEngagementCard";

export default function PetitionListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
const { topicId, title } = route.params;

  const [petitions, setPetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetch(`${API_BASE_URL}/petitions/topics/${topicId}`)
      .then((res) => res.json())
      .then(setPetitions)
      .finally(() => setLoading(false));
  }, [topicId]);

  return (
    <>
    <BackRow/>
  
    <Screen title={title}>
      <Section label="Active Petitions">
        <FlatList
          data={petitions}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({ item }) => (
        <TrendingEngagementCard
          data={{
            type: "petition",
            id: item.id,
            title: item.title,
            description: item.description,
            signature_goal: item.signature_goal,
            signatures: item.signatures,
            progress: item.progress,
          }}
          onPress={() =>
            navigation.navigate("PetitionDetail", {
              petitionId: item.id,
            })
          }
        />
      )}
        />
      </Section>
    </Screen>
  </>
  );
}