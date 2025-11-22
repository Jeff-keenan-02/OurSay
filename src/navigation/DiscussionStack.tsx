import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "react-native-paper"; // <--- 1. Import Hook

import DiscussionsListScreen from "../screens/DiscussionsListScreen";
import DiscussionDetailScreen from "../screens/DiscussionDetailScreen";

export type DiscussionStackParams = {
  DiscussionsList: undefined;
  DiscussionDetail: { id: number; title: string };
};

const Stack = createNativeStackNavigator<DiscussionStackParams>();

export default function DiscussionStack() {
  const theme = useTheme(); // <--- 2. Get the Neo Dark colors

  return (
    <Stack.Navigator
      screenOptions={{
        // 3. Apply the Theme to the Header
        headerStyle: {
          backgroundColor: theme.colors.background, // Matches screen background
        },
        headerTintColor: theme.colors.onBackground, // White text
        headerTitleStyle: {
          fontWeight: "bold",
        },
        // 4. Important: Set the background of the screen container itself
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="DiscussionsList"
        component={DiscussionsListScreen}
        options={{ title: "Discussions" }}
      />

      <Stack.Screen
        name="DiscussionDetail"
        component={DiscussionDetailScreen}
        options={({ route }) => ({ title: route.params.title })}
      />
    </Stack.Navigator>
  );
}