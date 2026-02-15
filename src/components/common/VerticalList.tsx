import React from "react";
import { FlatList, FlatListProps } from "react-native";

export function VerticalList<T>(
  props: FlatListProps<T>
) {
  return (
    <FlatList
      scrollEnabled={false}
      contentContainerStyle={{
        gap: 12,
      }}
      {...props}
    />
  );
}