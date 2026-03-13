// src/layout/Section.tsx
import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";


interface SectionProps {
  label?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}
export function Section({ label, subtitle, children, style }: SectionProps) {
  const theme = useTheme();

  return (
    <View style={styles.label}>
      {label && (
        <Text
          variant={typography.sectionTitle}
          style={styles.label}
        >
          {label}
        </Text>
      )}

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

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.sm, // more breathing between sections
  },

  label: {
    marginBottom: spacing.xs, // proper space before content
  },

  subtitle: {
    marginBottom: spacing.lg,
  },

  content: {
    marginTop: spacing.sm,
  },
});