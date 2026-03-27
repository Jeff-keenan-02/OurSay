import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AccessStatusChip } from "../common/AccessStatusChip";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function StickyCommentBar({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = "Write a comment…",
}: Props) {
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
        {disabled && (
          <View style={styles.lockedRow}>
            <AccessStatusChip variant="locked" requiredTier={1} />
          </View>
        )}
        <View style={styles.inputRow}>
          <TextInput
            mode="flat"
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            editable={!disabled}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            style={[
              styles.input,
              { backgroundColor: theme.colors.background },
            ]}
          />

          <Button
            mode="contained"
            onPress={onSubmit}
            disabled={disabled}
            style={styles.button}
          >
            Post
          </Button>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    padding: 8,
    borderTopWidth: 1,
    gap: 6,
  },
  lockedRow: {
    paddingHorizontal: 4,
  },
  inputRow: {
    flexDirection: "row",
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