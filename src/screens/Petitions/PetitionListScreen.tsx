import React, { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { Text, Button, Divider, useTheme } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { API_BASE_URL } from "../../config/api";
import { BackRow } from "../../components/common/BackRow";

export default function PetitionListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { topicId, TopicTitle } = route.params;

  const [petitions, setPetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetch(`${API_BASE_URL}/petitions/topics/${topicId}/petitions`)
      .then((res) => res.json())
      .then(setPetitions)
      .finally(() => setLoading(false));
  }, [topicId]);

  return (
    <>
    <BackRow/>
  
    <Screen title={TopicTitle}>
      <Section label="Active Petitions">
        <FlatList
          data={petitions}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({ item }) => (
            <View style={{ paddingVertical: 12 }}>
              <Text variant="titleMedium">{item.title}</Text>

              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {item.description}
              </Text>

              <Text style={{ color: theme.colors.primary }}>
                {item.signatures} signatures
              </Text>

              <Button
                mode="outlined"
                style={{ marginTop: 8 }}
                onPress={() =>
                  navigation.navigate("PetitionDetail", {
                    petitionId: item.id,
                  })
                }
              >
                View Petition
              </Button>
            </View>
          )}
        />
      </Section>
    </Screen>
  </>
  );
}