// src/navigation/DiscussionStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DiscussionsListScreen from "../screens/DiscussionsListScreen";
import DiscussionDetailScreen from "../screens/DiscussionDetailScreen";

// ---- DEFINE TYPES FOR NAVIGATION ----
export type DiscussionStackParams = {
  DiscussionsList: undefined;
  DiscussionDetail: { id: number; title: string };
};

const Stack = createNativeStackNavigator<DiscussionStackParams>();

export default function DiscussionStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DiscussionsList"
        component={DiscussionsListScreen}
        options={{ title: "Discussions" }}
      />

      <Stack.Screen
        name="DiscussionDetail"
        component={DiscussionDetailScreen}
        options={({ route }) => ({
          title: route.params.title,
        })}
      />
    </Stack.Navigator>
  );
}