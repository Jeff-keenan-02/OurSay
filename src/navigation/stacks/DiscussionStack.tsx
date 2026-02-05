import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { IconButton, useTheme } from "react-native-paper"; 

import DiscussionsListScreen from "../../screens/Discussions/DiscussionListScreen";
import DiscussionDetailScreen from "../../screens/Discussions/DiscussionDetailScreen";

import { DiscussionStackParams } from "../types/DiscussionStackTypes";
import DiscussionCategoriesScreen from "../../screens/Discussions/DiscussionCategoriesScreen";
import { tierHeaderRight } from "../headerOptions";
import { AuthContext } from "../../context/AuthContext";


const Stack = createNativeStackNavigator<DiscussionStackParams>();

export default function DiscussionStack({navigation}: any) {
  const theme = useTheme(); // <---Get the Neo Dark colors
  const { user } = useContext(AuthContext); // <---Get user info for conditional header button
  return (
    <Stack.Navigator
      screenOptions={{
      ...(user
      ? tierHeaderRight({
          tier: user.verification_level,
          onPress: () =>
            navigation.navigate("Main", { screen: "Verify" }),
        })
      : {}),
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