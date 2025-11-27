import React, { useContext } from "react";
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

import { DiscussionCategory } from "../../types/DiscussionCategory";
import DiscussionCardTrending from "../../components/DiscussionCards/DisscussionCardTrending";

import { useDiscussionCategories } from "../../hooks/useDiscussionCategories";
import { useTrendingDiscussions } from "../../hooks/useTrendingDiscussions";
import { useDiscussionVote } from "../../hooks/useDiscussionVote";
import { AuthContext } from "../../context/AuthContext";

export default function DiscussionCategoriesScreen() {
  const theme = useTheme();
  const navigation: any = useNavigation();
  const { user } = useContext(AuthContext);

  const API = "http://localhost:3000";

  const { categories, loading } = useDiscussionCategories(API);
  const { discussions, setDiscussions } = useTrendingDiscussions(API);
  const { vote } = useDiscussionVote(API, user, setDiscussions);

  // Top 3 trending
  const trending = discussions.slice(0, 3);

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
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      
      {/* HEADER */}
      <View style={styles.headerBlock}>
        <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
          Discussions
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          Explore topics and see what people care about today.
        </Text>
      </View>

      {/* TRENDING */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.colors.primary }]}>
          Trending Discussions
        </Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          Top conversations happening right now
        </Text>

        <FlatList
          data={trending}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <DiscussionCardTrending
              discussion={item}
              onPress={() => openDiscussion(item.id, item.title)}
              onVote={vote}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>

      {/* CATEGORIES */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.colors.primary }]}>
          Browse by Category
        </Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          Choose a topic to dive into specific discussions
        </Text>

        <FlatList
          data={categories}
          scrollEnabled={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => openCategory(item)}
              style={[styles.categoryCard, { backgroundColor: theme.colors.surface }]}
            >
              <Text style={[styles.categoryTitle, { color: theme.colors.onSurface }]}>
                {item.title}
              </Text>
              {item.description && (
                <Text style={[styles.categoryDescription, { color: theme.colors.onSurfaceVariant }]}>
                  {item.description}
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    padding: 20,
    paddingTop: 30,
    textAlign: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 6,
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 15,
    textTransform: "uppercase",
    fontWeight: "600",
    paddingHorizontal: 16,
  },
  sectionSubtitle: {
    fontSize: 13,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  categoryCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  categoryDescription: {
    marginTop: 4,
    fontSize: 14,
  },
});