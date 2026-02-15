import React from "react";
import { FlatList, FlatListProps } from "react-native";

export function HorizontalList<T>(
  props: FlatListProps<T>
) {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: 12,
        paddingRight: 16,
      }}
      {...props}
    />
  );
}