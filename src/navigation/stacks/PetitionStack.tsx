import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PetitionListScreen from "../../screens/Petitions/PetitionListScreen";
import { PetitionStackParamList } from "../types/PetitionStackParamList";
import PetitionDetailScreen from "../../screens/Petitions/PetitionDetailScreen";
import PetitionCategoryScreen from "../../screens/Petitions/PetitionCategoriesScreen";


const Stack = createNativeStackNavigator<PetitionStackParamList>();

export default function PetitionStack() {



  return (
    <Stack.Navigator
        screenOptions={{        
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="PetitionCategory"
        component={PetitionCategoryScreen}
      />

      <Stack.Screen
        name="PetitionList"
        component={PetitionListScreen}
      />

      <Stack.Screen
        name="PetitionDetail"
        component={PetitionDetailScreen}
      />

    </Stack.Navigator>
  );
}