import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "react-native-paper"; // <--- 1. Import Hook

import DiscussionsListScreen from "../screens/Discussions/DiscussionsListScreen";
import DiscussionDetailScreen from "../screens/Discussions/DiscussionDetailScreen";
import DiscussionCategoriesScreen from "../screens/Discussions/discussionCategoriesScreen";

export type DiscussionStackParams = {
  DiscussionCategories: undefined;
  DiscussionsList: { categoryId: number | null; title: string };
  DiscussionDetail: { id: number; title: string };
};

const Stack = createNativeStackNavigator<DiscussionStackParams>();

export default function DiscussionStack() {
  const theme = useTheme(); // <---Get the Neo Dark colors

  return (
    <Stack.Navigator
      screenOptions={{

        headerStyle: {
          backgroundColor: theme.colors.background, // Matches screen background
        },
        headerTintColor: theme.colors.onBackground,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        // Set the background of the screen container itself
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="DiscussionCategories"
        component={DiscussionCategoriesScreen}
        options={{ title: "Discussion Categories" }}
      />
      <Stack.Screen
        name="DiscussionsList"
        component={DiscussionsListScreen}
        options={{ title: "Discussions" }}
      />

      <Stack.Screen
        name="DiscussionDetail"
        component={DiscussionDetailScreen}
          options={{ title: "Thread" }}
      />
    </Stack.Navigator>
  );
}