import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, TextInput, useTheme } from "react-native-paper";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

export function StickyCommentBar({ value, onChange, onSubmit }: Props) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      <TextInput
        mode="flat"
        value={value}
        onChangeText={onChange}
        placeholder="Write a comment…"
        placeholderTextColor={theme.colors.onSurfaceVariant}
        style={[
          styles.input,
          { backgroundColor: theme.colors.background },
        ]}
      />
      <Button mode="contained" onPress={onSubmit} style={styles.button}>
        Post
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    elevation: 10,
  },
  input: {
    flex: 1,
    borderRadius: 8,
    marginRight: 8,
  },
  button: {
    borderRadius: 8,
    height: 45,
    justifyContent: "center",
  },
});