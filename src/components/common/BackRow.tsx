import { View, StyleSheet } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { spacing } from "../../theme/spacing";

export function BackRow({ label = "Back" }) {
  const navigation = useNavigation();

  if (!navigation.canGoBack()) return null;

  return (
    <View style={styles.container}>
      <IconButton
        icon="arrow-left"
        size={20}
        onPress={() => navigation.goBack()}
      />
      <Text>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",

    // cancel Screen horizontal padding
    marginLeft: -spacing.md,

    // restore proper touch padding
    paddingLeft: spacing.md,
    paddingVertical: spacing.xs,
  },
});