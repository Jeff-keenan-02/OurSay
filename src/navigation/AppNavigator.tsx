import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { IconButton, useTheme } from "react-native-paper";

import HomeScreen from "../screens/HomeScreen";
import VerifyPassportScreen from "../screens/VerifyPassportScreen";
import SettingsScreen from "../screens/SettingsScreen";
import DiscussionStack from "./stacks/DiscussionStack";
import PollStack from "./stacks/PollStack";
import HomeStack from "./stacks/HomeStack";
import VerifyStack from "./stacks/VerifyStack";
import SettingsStack from "./stacks/SettingsStack";



const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const theme = useTheme(); 

  return (
      <Tab.Navigator
      screenOptions={{
        // --- Native Header Styling ---
        headerStyle: {
          backgroundColor: theme.colors.background,
          height: 60,                    // Clean height like Stack
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: "700",
          color: theme.colors.onBackground,
        },

        // --- Bottom Tab Bar Styling ---
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          height: 64,
          paddingBottom: 6,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Polls"
        component={PollStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="ballot-outline" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Discussions"
        component={DiscussionStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="comment-multiple-outline" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Verify"
        component={VerifyStack}
        options={{
          headerShown: false,
          title:"",
          tabBarLabel: "Verify ID",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="shield-check-outline" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}