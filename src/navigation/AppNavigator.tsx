import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "react-native-paper"; // <--- Import this!

import HomeScreen from "../screens/HomeScreen";
import PollsScreen from "../screens/PollsScreen";
import VerifyPassportScreen from "../screens/VerifyPassportScreen";
import SettingsScreen from "../screens/SettingsScreen";
import DiscussionStack from "./DiscussionStack";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const theme = useTheme(); // <--- Hook into your Neo Dark Theme

  return (
    <Tab.Navigator
      screenOptions={{
        // 1. Match the Top Header to your Theme
        headerStyle: {
          backgroundColor: theme.colors.background, 
          elevation: 0, // Android: Remove shadow line for a cleaner look
          shadowOpacity: 0, // iOS: Remove shadow line
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outline, // Subtle separation
        },
        headerTintColor: theme.colors.onBackground, // White text
        headerTitleStyle: { fontWeight: "bold" },

        // 2. Match the Bottom Tab Bar to your Theme
        tabBarStyle: {
          backgroundColor: theme.colors.surface, // Slightly lighter Slate
          borderTopColor: theme.colors.outline, // Subtle border
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        
        // 3. The "Neo" Pop
        tabBarActiveTintColor: theme.colors.primary, // Teal (Active)
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant, // Muted Grey (Inactive)
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