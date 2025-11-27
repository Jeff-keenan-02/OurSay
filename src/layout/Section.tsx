// src/layout/Section.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface SectionProps {
  label?: string;
  children: React.ReactNode;
}

export function Section({ label, children }: SectionProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text
          variant="labelLarge"
          style={{
            color: theme.colors.primary,
            marginBottom: 8,
            letterSpacing: 0.5,
          }}
        >
          {label.toUpperCase()}
        </Text>
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
  },
});