// components/SwipeDeck/SwipeActions.tsx
import React from "react";
import { FAB } from "react-native-paper";
import { StyleSheet } from "react-native";

export default function SwipeActions({
  onYes,
  onNo,
}: {
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <>
      <FAB
        icon="close"
        color="white"
        style={[styles.fab, styles.noButton]}
        onPress={onNo}
      />
      <FAB
        icon="check"
        color="white"
        style={[styles.fab, styles.yesButton]}
        onPress={onYes}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 20,
    zIndex: 30,
  },
  noButton: {
    left: 40,
    backgroundColor: "#b54949",
  },
  yesButton: {
    right: 40,
    backgroundColor: "#4caf50",
  },
});