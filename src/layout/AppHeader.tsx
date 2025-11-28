import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";

type Props = {
  title: string;
  subtitle?: string;
};

export function AppHeader({ title, subtitle }: Props) {
  const theme = useTheme();

  return (
      <View style={[styles.wrapper, { borderBottomColor: theme.colors.outlineVariant }]}>
        <Text
          style={[
            typography.screenTitle,
            styles.title,
            { color: theme.colors.onBackground }
          ]}
        >
          {title}
        </Text>

        {subtitle && (
          <Text
            style={[
              typography.body,
              styles.subtitle,
              { color: theme.colors.onSurfaceVariant }
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
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 0,
    borderBottomWidth: 0,  // Thin iOS-style divider
  },
  title: {
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitle: {
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});