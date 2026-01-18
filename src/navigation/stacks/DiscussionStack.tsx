import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { IconButton, useTheme } from "react-native-paper"; 

import DiscussionsListScreen from "../../screens/Discussions/DiscussionsListScreen";
import DiscussionDetailScreen from "../../screens/Discussions/DiscussionDetailScreen";
import DiscussionCategoriesScreen from "../../screens/Discussions/DiscussionCategoriesScreen";
import { DiscussionStackParams } from "../types/DiscussionStackTypes";


const Stack = createNativeStackNavigator<DiscussionStackParams>();

export default function DiscussionStack({navigation}: any) {
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
        options={{ title: "Categories",
        headerLeft: () => (
          <IconButton
            icon="menu"
            onPress={() => navigation.getParent()?.openDrawer()}
          />
        ),
         }}
      />
      <Stack.Screen
        name="DiscussionsList"
        component={DiscussionsListScreen}
        options={{ title: "" }}
      />

      <Stack.Screen
        name="DiscussionDetail"
        component={DiscussionDetailScreen}
          options={{ title: "Thread" }}
      />
    </Stack.Navigator>
  );
}