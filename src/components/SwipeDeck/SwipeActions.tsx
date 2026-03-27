// components/SwipeDeck/SwipeActions.tsx

import React from "react";
import { FAB } from "react-native-paper";
import { StyleSheet, View } from "react-native";

type Props = {
  onYes: () => void;
  onNo: () => void;
  disabled?: boolean;
};

export default function SwipeActions({
  onYes,
  onNo,
  disabled = false,
}: Props) {
  return (
    <View style={styles.row}>
      <FAB
        icon="close"
        color="white"
        style={[styles.noButton, disabled && styles.disabled]}
        disabled={disabled}
        onPress={onNo}
      />
      <FAB
        icon="check"
        color="white"
        style={[styles.yesButton, disabled && styles.disabled]}
        disabled={disabled}
        onPress={onYes}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    paddingBottom: 40,
    paddingTop: 12,
  },
  noButton: {
    backgroundColor: "#b54949",
  },
  yesButton: {
    backgroundColor: "#4caf50",
  },
  disabled: {
    opacity: 0.5,
  },
});