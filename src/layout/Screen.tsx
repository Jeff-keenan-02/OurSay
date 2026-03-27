import React from "react";
import { View, ScrollView, StyleSheet, ViewStyle, StyleProp } from "react-native";
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
  titleColor?: string;
  contentStyle?: StyleProp<ViewStyle>;
}

export function Screen({
  title,
  subtitle,
  scroll = false,
  center = false,
  showBack = false,
  bottom,
  children,
  titleColor,
  contentStyle,
}: ScreenProps) {
  const theme = useTheme();

  const screenBody = (
    <>
      {showBack && (
        <View style={styles.backRowWrap}>
          <BackRow />
        </View>
      )}

      {title && (
        <View style={styles.headerWrapper}>
          <AppHeader
            title={title}
            subtitle={subtitle}
          />
        </View>
      )}

      <View
        style={[
          styles.content,
          center && styles.centerContent,
          contentStyle,
        ]}
      >
        {children}
      </View>

      {bottom ? <View style={styles.bottom}>{bottom}</View> : null}
    </>
  );

  if (scroll) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        {screenBody}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {screenBody}
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
    flexGrow: 1,
    paddingBottom: spacing.lg,
  },
  backRowWrap: {
    marginBottom: spacing.xs,
  },
  headerWrapper: {
    marginBottom: spacing.md,
  },
  content: {
    flex: 1,
    gap: spacing.sm,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  bottom: {
    marginTop: spacing.md,
    paddingBottom: spacing.sm,
  },
});