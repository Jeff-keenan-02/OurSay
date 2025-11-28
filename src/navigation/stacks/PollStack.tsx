import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useTheme } from "react-native-paper";
import PollTopicsScreen from "../../screens/Polls/PollTopicsScreen";
import SwipePollScreen from "../../screens/Polls/SwipePollScreen";

const Stack = createNativeStackNavigator();

export default function PollStack() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.onBackground,
        contentStyle: { backgroundColor: theme.colors.background }
      }}
    >
      <Stack.Screen
        name="PollTopics"
        component={PollTopicsScreen}
        options={{ title: "Poll Topics" }}
      />

      <Stack.Screen
        name="SwipePoll"
        component={SwipePollScreen}
        options={{ title: "Poll",
              gestureEnabled: false, 
         }}
      />
    </Stack.Navigator>
  );
}