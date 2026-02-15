// components/common/ScreenState.tsx

import { View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

export function ScreenLoader() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export function ScreenError({ message }: { message: string }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{message}</Text>
    </View>
  );
}