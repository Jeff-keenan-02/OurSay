import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { IconButton, useTheme } from "react-native-paper";
import PollTopicsScreen from "../../screens/Polls/PollTopicsScreen";
import SwipePollScreen from "../../screens/Polls/SwipePollScreen";
import { AuthContext } from "../../context/AuthContext";
import { tierHeaderRight } from "../headerOptions";

const Stack = createNativeStackNavigator();

export default function PollStack({navigation}: any) {
  const theme = useTheme();
  const { user } = useContext(AuthContext);

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
        
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.onBackground,
        contentStyle: { backgroundColor: theme.colors.background }
      }}
    >
      <Stack.Screen
        name="PollTopics"
        component={PollTopicsScreen}
        options={{ title: "Poll Topics",
        headerLeft: () => (
          <IconButton
            icon="menu"
            onPress={() => navigation.getParent()?.openDrawer()}
          />
        ),

         }}
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