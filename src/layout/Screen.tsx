// src/layout/Screen.tsx
import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { globalStyles } from "../styles/globalStyles";

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
        {title && (
          <Text
            variant="headlineMedium"
            style={[styles.title, { color: theme.colors.onBackground }]}
          >
            {title}
          </Text>
        )}

        {subtitle && (
          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            {subtitle}
          </Text>
        )}

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
      {title && (
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: theme.colors.onBackground }]}
        >
          {title}
        </Text>
      )}

      {subtitle && (
        <Text
          variant="bodyMedium"
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          {subtitle}
        </Text>
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  title: {
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 18,
  },
});