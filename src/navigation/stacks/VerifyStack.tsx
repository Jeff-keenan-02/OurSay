import { createNativeStackNavigator } from "@react-navigation/native-stack";
import VerifyPassportScreen from "../../screens/Verify/VerifyPassportScreen";
import { IconButton, useTheme } from "react-native-paper"; 

const Stack = createNativeStackNavigator();

export default function VerifyStack({navigation}: any) {
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
          headerLeft: () => (
            <IconButton
              icon="menu"
              onPress={() => navigation.openDrawer()}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
}