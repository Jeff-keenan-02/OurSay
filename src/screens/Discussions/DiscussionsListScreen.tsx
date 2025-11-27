import React, { useCallback, useContext } from "react";
import { View, FlatList, Alert } from "react-native";
import { RouteProp, useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { Text, useTheme } from "react-native-paper";

import { AuthContext } from "../../context/AuthContext";
import { globalStyles } from "../../theme/globalStyles";
import DiscussionCard from "../../components/DiscussionCards/DisscussionCard";

import { useDiscussionVote } from "../../hooks/useDiscussionVote";
import { useCategoryDiscussions } from "../../hooks/useCategoryDiscussions";
import { Discussion } from "../../types/Discussion";
import { DiscussionStackParams } from "../../navigation/DiscussionStack";

export default function DiscussionsListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);

  const API = "http://localhost:3000";

  // ✅ Strongly-typed route params
  const route = useRoute<RouteProp<DiscussionStackParams, "DiscussionsList">>();
  const { categoryId, title } = route.params;

  // ✅ Load only discussions from this category
  const { discussions, loading, setDiscussions, loadDiscussions } = useCategoryDiscussions(API, categoryId);

  // ✅ Voting hook updates the same discussions state
  const { vote } = useDiscussionVote(API, user, setDiscussions);

  const openDiscussion = (id: number) => {
    navigation.navigate("DiscussionDetail", { id, title });
  };

  const handleVote = (id: number, direction: "up" | "down") => {
    if (!user) return Alert.alert("You must be logged in to vote");
    vote(id, direction);
  };
  // ⬅️ when screen comes back into focus, reload discussions
  useFocusEffect(
    useCallback(() => {
    loadDiscussions(); 
    }, [loadDiscussions])
  );

  return (
    <View style={globalStyles.screen}>
      <Text
        variant="headlineMedium"
        style={{
          color: theme.colors.onBackground,
          textAlign: "center",
          marginBottom: 6,
          fontWeight: "700",
        }}
      >
        {title}
      </Text>

      <Text
        variant="bodyMedium"
        style={{
          color: theme.colors.onSurfaceVariant,
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        See what people are saying in this category.
      </Text>

      {loading ? (
        <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
          Loading discussions...
        </Text>
      ) : (
        <FlatList<Discussion>
          data={discussions}
          renderItem={({ item }) => (
            <DiscussionCard
              discussion={item}
              onPress={() => openDiscussion(item.id)}
              onVote={handleVote}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
}