import React, { useContext } from "react";
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { DiscussionCategory } from "../../types/DiscussionCategory";
import DiscussionCardTrending from "../../components/Discussion/DisscussionCardTrending";
import { useDiscussionCategories } from "../../hooks/discussions/useDiscussionCategories";
import { useTrendingDiscussions } from "../../hooks/discussions/useTrendingDiscussions";
import { useDiscussionVote } from "../../hooks/discussions/useDiscussionVote";
import { AuthContext } from "../../context/AuthContext";
import { Section } from "../../layout/Section";
import { Screen } from "../../layout/Screen";
import { CategoryCard } from "../../components/Discussion/CategoryCard";
import { API_BASE_URL } from "../../config/api";

export default function DiscussionCategoriesScreen() {
  const theme = useTheme();
  const navigation: any = useNavigation();
  const { user } = useContext(AuthContext);

  const API = API_BASE_URL;

  // hook for categories
  const { categories, loading } = useDiscussionCategories();

  //hook for trending discussions
  const { discussions, setDiscussions } = useTrendingDiscussions();

  // Top 3 trending prevent errors
  const trending = discussions.slice(0, 3);

  //hook upvoting or downvoting
  const { vote } = useDiscussionVote (user, setDiscussions);



  const openCategory = (category: DiscussionCategory) => {
    navigation.navigate("DiscussionsList", {
      categoryId: category.id,
      title: category.title,
    });
  };

  const openDiscussion = (id: number, title: string) => {
    navigation.navigate("Discussions", {
      screen: "DiscussionDetail",
      params: { id, title },
    });
  };

    return (
    <Screen scroll>
      {/* Trending Section */}
      <Section label="Trending Discussions">
        <FlatList
          data={trending}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingRight: 16 }}
          renderItem={({ item }) => (
            <DiscussionCardTrending
              discussion={item}
              onPress={() => openDiscussion(item.id, item.title)}
              onVote={vote}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      </Section>

      {/* Categories Section */}
      <Section label="Browse by Category">
        <FlatList
          data={categories}
          scrollEnabled={false}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <CategoryCard
              title={item.title}
              description={item.description}
              icon="dots-grid"
              onPress={() => openCategory(item)}
            />
          )}
        />
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  categoryCard: {
    padding: 16,
    borderRadius: 14,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  categoryDescription: {
    fontSize: 14,
    marginTop: 4,
  },
});