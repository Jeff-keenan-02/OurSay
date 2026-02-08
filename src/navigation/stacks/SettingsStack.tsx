import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsScreen from "../../screens/Settings/SettingsScreen";


const Stack = createNativeStackNavigator();

export default function SettingsStack() {


  return (
    <Stack.Navigator
      screenOptions={{        
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
      />
    </Stack.Navigator>
  );
}