import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "react-native-paper";
import CreateMenuScreen from "../../screens/Create/CreateMenuScreen";
import CreateDiscussionScreen from "../../screens/Create/CreateDiscussionScreen";
import CreatePetitionScreen from "../../screens/Create/CreatePetitionScreen";



const Stack = createNativeStackNavigator();

export default function CreateStack() {

  return (
    <Stack.Navigator
      screenOptions={{        
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="CreateMenu"
        component={CreateMenuScreen}
        options={{
          title: "Create",
        }}
      />

      <Stack.Screen
        name="CreateDiscussion"
        component={CreateDiscussionScreen}
      />

      <Stack.Screen
        name="CreatePetition"
        component={CreatePetitionScreen}
      />
    </Stack.Navigator>
  );
}