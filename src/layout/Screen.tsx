// src/layout/Screen.tsx
import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { AppHeader } from "./AppHeader";
import { BackRow } from "../components/common/BackRow";
import { spacing } from "../theme/spacing";

interface ScreenProps {
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  center?: boolean;
  showBack?: boolean;
  bottom?: React.ReactNode; 
  children: React.ReactNode;
}

export function Screen({
  title,
  subtitle,
  scroll = false,
  center = false,
  showBack = false,
  bottom,
  children,
}: ScreenProps) {
  const theme = useTheme();

  const content = (
    <>
      {/* Back button */}
      {showBack && <BackRow />}

      {/* Header */}
      {title && (
        <View style={styles.headerWrapper}>
          <AppHeader title={title} subtitle={subtitle} />
        </View>
      )}

      {/* Page Content */}
      <View
        style={[
          styles.content,
          center && {
            justifyContent: "center",
            alignItems: "center",
          },
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
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  scrollContent: {
    paddingBottom: spacing.sm,
  },
  headerWrapper: {
    marginBottom: spacing.md,
  },
  content: {
    flex: 1,
    gap: spacing.sm,
  },
});