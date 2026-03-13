import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AnalyticsHomeScreen from "../../screens/Analytics/AnalyticsHomeScreen";
import PollAnalyticsListScreen from "../../screens/Analytics/PollAnalyticsListScreen";
import PetitionAnalyticsListScreen from "../../screens/Analytics/PetitionAnalyticsListScreen";
import PollAnalyticsDetailScreen from "../../screens/Analytics/PollAnalyticsDetailScreen";


const Stack = createNativeStackNavigator();

export default function AnalyticsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="AnalyticsHome"
        component={AnalyticsHomeScreen}
      />

      <Stack.Screen
        name="PollAnalyticsList"
        component={PollAnalyticsListScreen}
      />

      <Stack.Screen
        name="PetitionAnalyticsList"
        component={PetitionAnalyticsListScreen}
      />

      <Stack.Screen
        name="PollAnalyticsDetail"
        component={PollAnalyticsDetailScreen}
      />

      <Stack.Screen
        name="PetitionAnalyticsDetail"
        component={PetitionAnalyticsListScreen}
      />
    </Stack.Navigator>
  );
}