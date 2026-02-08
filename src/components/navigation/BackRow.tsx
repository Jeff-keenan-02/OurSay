// src/components/BackRow.tsx
import { View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

export function BackRow({ label = "Back" }) {
  const navigation = useNavigation();

  if (!navigation.canGoBack()) return null;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", padding: 8 }}>
      <IconButton
        icon="arrow-left"
        size={20}
        onPress={() => navigation.goBack()}
      />
      <Text>{label}</Text>
    </View>
  );
}