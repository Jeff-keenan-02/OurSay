import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsScreen from "../../screens/Settings/SettingsScreen";
import { IconButton, useTheme } from "react-native-paper"; 
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { tierHeaderRight } from "../headerOptions";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";

const Stack = createNativeStackNavigator();

export default function SettingsStack() {
  const theme = useTheme();

  const { user } = useContext(AuthContext);
const navigation = useNavigation<any>();
  return (
    <Stack.Navigator
      screenOptions={{

        ...(user
    ? tierHeaderRight({
        tier: user.verification_level,
        onPress: () =>
          navigation.navigate("Main", { screen: "Verify" }),
      })
    : {}),
        headerStyle: {
          backgroundColor: theme.colors.background, 
        },
        headerTintColor: theme.colors.onBackground,
        headerTitleStyle: {
          fontWeight: "bold",
        },

        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{
          title: "Settings",
          headerLeft: () => (
            <IconButton
              icon="menu"
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
}