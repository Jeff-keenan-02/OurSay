import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PetitionListScreen from "../../screens/Petitions/PetitionListScreen";
import PetitionDetailScreen from "../../screens/Petitions/PetitionDetailScreen";
import PetitionHomeScreen from "../../screens/Petitions/PetitionHomeScreen";
import PetitionAnalyticsDetailScreen from "../../screens/Analytics/PetitionAnalyticsDetailScreen";


const Stack = createNativeStackNavigator();

export default function PetitionStack() {



  return (
    <Stack.Navigator
        screenOptions={{        
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="PetitionHome"
        component={PetitionHomeScreen}
      />

      <Stack.Screen
        name="PetitionList"
        component={PetitionListScreen}
      />

      <Stack.Screen
        name="PetitionDetail"
        component={PetitionDetailScreen}
      />

      <Stack.Screen
        name="PetitionAnalyticsDetail"
        component={PetitionAnalyticsDetailScreen}
      />
    </Stack.Navigator>
  );
}