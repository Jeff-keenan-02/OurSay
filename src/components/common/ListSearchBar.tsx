import React from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { spacing } from "../../theme/spacing";

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
};

export function ListSearchBar({ value, onChangeText, placeholder = "Search…" }: Props) {
  const theme = useTheme();
  return (
    <View style={[styles.bar, { backgroundColor: theme.colors.surface }]}>
      <MaterialCommunityIcons name="magnify" size={18} color={theme.colors.onSurfaceVariant} />
      <TextInput
        style={[styles.input, { color: theme.colors.onSurface }]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")}>
          <MaterialCommunityIcons name="close-circle" size={16} color={theme.colors.onSurfaceVariant} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
});
