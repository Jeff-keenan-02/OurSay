import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DiscussionsListScreen from "../../screens/Discussions/DiscussionListScreen";
import DiscussionDetailScreen from "../../screens/Discussions/DiscussionDetailScreen";
import DiscussionHomeScreen from "../../screens/Discussions/DiscussionHomeScreen";



const Stack = createNativeStackNavigator();

export default function DiscussionStack() {
  return (
    <Stack.Navigator
       screenOptions={{        
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="DiscussionHome"
        component={DiscussionHomeScreen}
      />
      <Stack.Screen
        name="DiscussionsList"
        component={DiscussionsListScreen}
      />

      <Stack.Screen
        name="DiscussionDetail"
        component={DiscussionDetailScreen}
      />
    </Stack.Navigator>
  );
}