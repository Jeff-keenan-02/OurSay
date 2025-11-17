// src/navigation/AppNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/HomeScreen";
import PollsScreen from "../screens/PollsScreen";
import VerifyPassportScreen from "../screens/VerifyPassportScreen";
import SettingsScreen from "../screens/SettingsScreen";
import DiscussionStack from "./DiscussionStack";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Polls" component={PollsScreen} />
      <Tab.Screen name="Discuss" component={DiscussionStack} />
      <Tab.Screen name="Verify" component={VerifyPassportScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}