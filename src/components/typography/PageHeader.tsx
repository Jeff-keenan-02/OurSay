import React from "react";
import { Text, useTheme } from "react-native-paper";

export function PageHeader({ title }: { title: string }) {
  const theme = useTheme();

  return (
    <Text
      variant="headlineLarge"
      style={{
        color: theme.colors.onBackground,
        marginBottom: 12,
        fontWeight: "700",
        textAlign: "left",
      }}
    >
      {title}
    </Text>
  );
}