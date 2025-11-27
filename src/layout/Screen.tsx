// src/layout/Screen.tsx
import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface ScreenProps {
  title?: string;
  subtitle?: string;
  scroll?: boolean; // default false
  children: React.ReactNode;
}

export function Screen({ title, subtitle, scroll = false, children }: ScreenProps) {
  const theme = useTheme();

  const Container = scroll ? ScrollView : View;

  return (
    <Container
      style={[
        styles.container,
        { backgroundColor: theme.colors.background }
      ]}
      contentContainerStyle={scroll ? styles.scrollContent : undefined}
    >
      {/* Page Title */}
      {title && (
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: theme.colors.onBackground }]}
        >
          {title}
        </Text>
      )}

      {/* Page Subtitle */}
      {subtitle && (
        <Text
          variant="bodyMedium"
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          {subtitle}
        </Text>
      )}

      {children}
    </Container>
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