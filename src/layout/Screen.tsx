// src/layout/Screen.tsx
import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { globalStyles } from "../styles/globalStyles";
import { AppHeader } from "./AppHeader";

interface ScreenProps {
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  center?: boolean;
  children: React.ReactNode;
}

export function Screen({
  title,
  subtitle,
  scroll = false,
  center = false,
  children,
}: ScreenProps) {
  const theme = useTheme();

  if (scroll) {
    return (
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
        contentContainerStyle={[
          styles.scrollContent,
          center ? globalStyles.screenCenter : null, // ⬅️ center INSIDE scroll
        ]}
      >
        {/* Unified App Header */}
        {title && <AppHeader title={title} subtitle={subtitle} />}


        {children}
      </ScrollView>
    );
  }

  // No scroll
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
        center ? globalStyles.screenCenter : null, // ⬅️ center whole screen
      ]}
    >
      {/* Unified App Header */}
      {title && <AppHeader title={title} subtitle={subtitle} />}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  paddingHorizontal: 10,
  paddingTop: 0,
  paddingBottom: 20,
  gap: 8,
},
  scrollContent: {
    paddingBottom: 0,
  },
});
