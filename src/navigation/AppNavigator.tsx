import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { IconButton, useTheme } from "react-native-paper";

import HomeScreen from "../screens/HomeScreen";
import PollsScreen from "../screens/PollsScreen";
import VerifyPassportScreen from "../screens/VerifyPassportScreen";
import SettingsScreen from "../screens/SettingsScreen";
import DiscussionStack from "./DiscussionStack";


const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const theme = useTheme(); 

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        tabBarStyle: { backgroundColor: theme.colors.surface },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Polls"
        component={PollsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (

            <MaterialCommunityIcons name="ballot-outline" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Discuss"
        component={DiscussionStack}
        options={{
          headerShown: false, // Keep this false as the Stack handles its own headers
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="comment-multiple-outline" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Verify"
        component={VerifyPassportScreen}
        options={{
          tabBarLabel: "Verify ID",
          tabBarIcon: ({ color, size }) => (
            // Using a shield icon usually implies trust/security more than just 'passport'
            <MaterialCommunityIcons name="shield-check-outline" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}