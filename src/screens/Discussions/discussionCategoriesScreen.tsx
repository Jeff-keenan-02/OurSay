import React, { useContext } from "react";
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

import { DiscussionCategory } from "../../types/DiscussionCategory";
import DiscussionCardTrending from "../../components/Discussion/DisscussionCardTrending";

import { useDiscussionCategories } from "../../hooks/useDiscussionCategories";
import { useTrendingDiscussions } from "../../hooks/useTrendingDiscussions";
import { useDiscussionVote } from "../../hooks/useDiscussionVote";
import { AuthContext } from "../../context/AuthContext";
import { Section } from "../../layout/Section";
import { Screen } from "../../layout/Screen";

export default function DiscussionCategoriesScreen() {
  const theme = useTheme();
  const navigation: any = useNavigation();
  const { user } = useContext(AuthContext);

  const API = "http://localhost:3000";

  // hook for categories
  const { categories, loading } = useDiscussionCategories(API);

  //hook for trending discussions
  const { discussions, setDiscussions } = useTrendingDiscussions(API);

  // Top 3 trending prevent errors
  const trending = discussions.slice(0, 3);

  //hook upvoting or downvoting
  const { vote } = useDiscussionVote(API, user, setDiscussions);



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
    <Screen
      scroll
      title="Discussions"
      subtitle="Explore topics and see what people care about today."
    >
      {/* Trending Section */}
      <Section label="Trending Discussions" subtitle="Top conversations happening right now">
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
      <Section label="Browse by Category" subtitle="Choose a topic to dive deeper">
        <FlatList
          data={categories}
          scrollEnabled={false}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => openCategory(item)}
              style={[styles.categoryCard, { backgroundColor: theme.colors.surface }]}
            >
              <Text style={[styles.categoryTitle, { color: theme.colors.onSurface }]}>
                {item.title}
              </Text>

              {item.description && (
                <Text
                  style={[styles.categoryDescription, { color: theme.colors.onSurfaceVariant }]}
                >
                  {item.description}
                </Text>
              )}
            </TouchableOpacity>
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