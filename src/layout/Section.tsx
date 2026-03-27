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
  titleColor?: string;
  titleRight?: React.ReactNode;
}

export function Section({
  label,
  subtitle,
  children,
  style,
  titleColor,
  titleRight,
}: SectionProps) {
  const theme = useTheme();

  const resolvedTitleColor = titleColor || theme.colors.primary;

  return (
    <View style={[styles.section, style]}>
      {label && (
        <View style={styles.headerRow}>
          <Text
            variant={typography.sectionTitle}
            style={[styles.label, { color: resolvedTitleColor }]}
          >
            {label}
          </Text>

          {titleRight}
        </View>
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
    marginBottom: spacing.sm,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },

  label: {
    fontWeight: "700",
  },

  subtitle: {
    marginBottom: spacing.lg,
  },

  content: {
    marginTop: spacing.sm,
  },
});