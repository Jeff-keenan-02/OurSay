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
      {/* Section Label */}
      {label && (
        <Text
          variant={typography.sectionTitle}
          style={{ marginBottom: spacing.xs }}
        >
          {label}
        </Text>
      )}

      {/* Optional Subtitle */}
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

      {/* Inner Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },

  subtitle: {
    marginBottom: spacing.lg,
  },

  content: {
    gap: spacing.sm,
  },
});