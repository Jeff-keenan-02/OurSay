// src/layout/Section.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";


interface SectionProps {
  label?: string;
  subtitle?: string;
  children: React.ReactNode;
}
export function Section({ label, subtitle, children }: SectionProps) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
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
    marginBottom: spacing.md, // more breathing between sections
  },

  label: {
    marginBottom: spacing.md, // proper space before content
  },

  subtitle: {
    marginBottom: spacing.md,
  },

  content: {
    gap: spacing.md, // slightly larger internal spacing
  },
});