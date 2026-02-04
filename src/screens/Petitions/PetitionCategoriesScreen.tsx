import React, { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { Text, Button, Divider, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { API_BASE_URL } from "../../config/api";

export default function PetitionCategoryScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/petitions/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Screen title="Petitions"><Text>Loading…</Text></Screen>;
  }

  return (
    <Screen title="Petition Categories">
      <Section>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({ item }) => (
            <View style={{ paddingVertical: 12 }}>
              <Text variant="titleMedium">{item.title}</Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {item.description}
              </Text>

              <Button
                mode="outlined"
                style={{ marginTop: 8 }}
                onPress={() =>
                  navigation.navigate("PetitionList", {
                    categoryId: item.id,
                    categoryTitle: item.title,
                  })
                }
              >
                View Petitions
              </Button>
            </View>
          )}
        />
      </Section>
    </Screen>
  );
}