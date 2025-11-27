// src/layout/Section.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";

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
        <Text style={[styles.label, { color: theme.colors.primary }]}>
          {label}
        </Text>
      )}

      {subtitle && (
        <Text
          style={[
            styles.subtitle,
            { color: theme.colors.onSurfaceVariant }
          ]}
        >
          {subtitle}
        </Text>
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 14,
  },
});