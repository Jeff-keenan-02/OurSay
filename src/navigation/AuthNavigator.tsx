// src/navigation/AuthNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "react-native-paper"; // <--- Import this

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const theme = useTheme(); // <--- Hook into Slate/Teal theme

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,

        // Ensure the background behind the animation is your Deep Slate color
        contentStyle: { backgroundColor: theme.colors.background },
        
        // 2. smooth animation (optional but nice)
        animation: 'slide_from_right', 
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}