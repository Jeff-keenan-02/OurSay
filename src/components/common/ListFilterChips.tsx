import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { spacing } from "../../theme/spacing";

export type FilterChip<T extends string> = {
  key: T;
  label: string;
  icon?: string;
};

export type TierFilterKey = "all" | "tier2" | "tier3";

const TIER_CHIPS: FilterChip<TierFilterKey>[] = [
  { key: "all",   label: "All Tiers",  icon: "account-group-outline" },
  { key: "tier2", label: "Tier 2+",    icon: "shield-half-full"      },
  { key: "tier3", label: "Tier 3",     icon: "shield-check"          },
];

type Props<T extends string> = {
  chips: FilterChip<T>[];
  active: T;
  onSelect: (key: T) => void;
  accent: string;
  /** If provided, renders a tier filter section after the main chips */
  tierFilter?: {
    active: TierFilterKey;
    onSelect: (key: TierFilterKey) => void;
  };
};

export function ListFilterChips<T extends string>({ chips, active, onSelect, accent, tierFilter }: Props<T>) {
  const theme = useTheme();

  const renderChip = <K extends string>(
    chip: FilterChip<K>,
    isActive: boolean,
    onPress: () => void,
    color: string
  ) => (
    <TouchableOpacity
      key={chip.key}
      onPress={onPress}
      style={[styles.chip, { backgroundColor: isActive ? color : theme.colors.surface }]}
    >
      {chip.icon && (
        <MaterialCommunityIcons
          name={chip.icon}
          size={13}
          color={isActive ? "#fff" : theme.colors.onSurfaceVariant}
        />
      )}
      <Text style={[styles.chipText, { color: isActive ? "#fff" : theme.colors.onSurfaceVariant }]}>
        {chip.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {chips.map((c) => renderChip(c, active === c.key, () => onSelect(c.key), accent))}
      </ScrollView>

      {tierFilter && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          {TIER_CHIPS.map((c) =>
            renderChip(c, tierFilter.active === c.key, () => tierFilter.onSelect(c.key), "#8b5cf6")
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  row: {
    flexGrow: 0,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
