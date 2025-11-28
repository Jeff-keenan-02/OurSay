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
          style={[
            typography.header,
            styles.label,
            { color: theme.colors.onBackground }
          ]}
        >
          {label}
        </Text>
      )}

      {/* Optional Subtitle */}
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

      {/* Inner Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xxl, // 32–40px
  },

  label: {
    marginBottom: spacing.xs,  // 6–8px
  },

  subtitle: {
    marginBottom: spacing.lg,  // 16–20px 
  },
  
  content: {
    marginTop: spacing.lg,
    gap: 10, // keep consistent spacing between children
  },
});