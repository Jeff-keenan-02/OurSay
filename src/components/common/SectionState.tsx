// components/common/SectionState.tsx

import { ActivityIndicator, Text } from "react-native-paper";

export function SectionLoader() {
  return <ActivityIndicator />;
}

export function SectionError({ message }: { message: string }) {
  return <Text>{message}</Text>;
}