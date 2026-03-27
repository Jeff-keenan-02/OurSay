import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = {
  title: string;
  subtitle?: string;
};

export function AppHeader({ title, subtitle }: Props) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { borderBottomColor: theme.colors.outline }
      ]}
    >
      <Text
        variant={typography.screenTitle}
        style={[
          styles.title,
          { color: theme.colors.primary }
        ]}
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          variant={typography.body}
          style={[
            styles.subtitle,
            { color: theme.colors.onSurfaceVariant }
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  title: {
    marginBottom: 2,
    fontWeight: "600",
    textAlign: "left",
  },
  subtitle: {
    fontWeight: "400",
    textAlign: "left",
  },
});