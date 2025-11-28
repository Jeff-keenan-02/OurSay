import { createNativeStackNavigator } from "@react-navigation/native-stack";
import VerifyPassportScreen from "../../screens/VerifyPassportScreen";
import { useTheme } from "react-native-paper"; 

const Stack = createNativeStackNavigator();

export default function VerifyStack() {
  const theme = useTheme(); // <---Get the Neo Dark colors
  return (
    <Stack.Navigator
      screenOptions={{

        headerStyle: {
          backgroundColor: theme.colors.background, // Matches screen background
        },
        headerTintColor: theme.colors.onBackground,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        // Set the background of the screen container itself
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >

      <Stack.Screen
        name="VerifyMain"
        component={VerifyPassportScreen}
        options={{
          title: "Verification",
        }}
      />
    </Stack.Navigator>
  );
}