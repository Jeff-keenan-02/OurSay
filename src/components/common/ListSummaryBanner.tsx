import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { spacing } from "../../theme/spacing";

export type SummaryStatItem = {
  label: string;
  value: string | number;
  color?: string;
};

type Props = {
  accent: string;
  stats: [SummaryStatItem, SummaryStatItem, SummaryStatItem];
};

export function ListSummaryBanner({ accent, stats }: Props) {
  const theme = useTheme();
  return (
    <View style={[styles.banner, { backgroundColor: accent + "15", borderColor: accent + "35" }]}>
      {stats.map((s, i) => (
        <React.Fragment key={s.label}>
          {i > 0 && <View style={[styles.divider, { backgroundColor: accent + "30" }]} />}
          <View style={styles.item}>
            <Text style={[styles.num, { color: s.color ?? accent }]}>{s.value}</Text>
            <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>{s.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  num: {
    fontSize: 22,
    fontWeight: "800",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    opacity: 0.8,
  },
  divider: {
    width: 1,
    marginVertical: 4,
  },
});
