import {createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "react-native-paper";
import AnalyticsScreen from "../../screens/Analytics/AnalyticsScreen";

const Stack = createNativeStackNavigator();

export default function AnalyticsStack() {

  return (
    <Stack.Navigator
         screenOptions={{        
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="AnalyticsMain"
        component={AnalyticsScreen}
      />
    </Stack.Navigator>
  );
}