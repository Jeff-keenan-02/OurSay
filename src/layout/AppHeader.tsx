// src/layout/AppHeader.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";

type Props = {
  title: string;
  subtitle?: string;
};

export function AppHeader({ title, subtitle }: Props) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.wrapper,
        { borderBottomColor: theme.colors.outline },
      ]}
    >
      <Text
        variant={typography.screenTitle}
        style={[
          styles.title,
          { color: theme.colors.onBackground },
        ]}
      >
        {title}
      </Text>

      {subtitle && (
        <Text
          variant={typography.body}
          style={[
            styles.subtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  title: {
    textAlign: "center",
    marginBottom: spacing.sm,   // slightly more breathing
    letterSpacing: 0.4,
  },

  subtitle: {
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
});