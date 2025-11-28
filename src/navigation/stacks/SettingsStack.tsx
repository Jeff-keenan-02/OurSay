import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsScreen from "../../screens/SettingsScreen";
import { useTheme } from "react-native-paper"; 

const Stack = createNativeStackNavigator();

export default function SettingsStack() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
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
        }}
      />
    </Stack.Navigator>
  );
}