// src/layout/Screen.tsx
import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { AppHeader } from "./AppHeader";
import { spacing } from "../theme/spacing";

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
          center && { justifyContent: "center", alignItems: "center" }
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
        center && { justifyContent: "center", alignItems: "center" }
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
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
});
