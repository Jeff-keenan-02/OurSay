import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../../screens/Home/HomeScreen";
import SwipePollScreen from "../../screens/Polls/SwipePollScreen";
import DiscussionDetailScreen from "../../screens/Discussions/DiscussionDetailScreen";
import PetitionDetailScreen from "../../screens/Petitions/PetitionDetailScreen";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    
    <Stack.Navigator
      screenOptions={{ headerShown: false,}}
    >
    <Stack.Screen
      name="HomeMain"
        component={HomeScreen}
      />
            {/* Add shared detail screens here */}
      <Stack.Screen name="PetitionDetail" component={PetitionDetailScreen} />
      <Stack.Screen name="DiscussionDetail" component={DiscussionDetailScreen} />
      <Stack.Screen name="SwipePoll" component={SwipePollScreen} />
      
    </Stack.Navigator>
  );
}