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

  const content = (
    <>
      {title && (
        <View style={styles.headerWrapper}>
          <AppHeader title={title} subtitle={subtitle} />
        </View>
      )}

      <View
        style={[
          styles.content,
          center && { justifyContent: "center", alignItems: "center" },
        ]}
      >
        {children}
      </View>
    </>
  );

  if (scroll) {
    return (
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {content}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },

  scrollContent: {
    paddingBottom: spacing.lg,
  },

  headerWrapper: {
    marginBottom: spacing.lg,
  },

  content: {
    gap: spacing.lg,
  },
});