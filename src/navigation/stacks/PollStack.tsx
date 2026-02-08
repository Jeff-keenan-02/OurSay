import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PollTopicsScreen from "../../screens/Polls/PollTopicsScreen";
import SwipePollScreen from "../../screens/Polls/SwipePollScreen";


const Stack = createNativeStackNavigator();

export default function PollStack() {


  return (
    <Stack.Navigator
      screenOptions={{        
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="PollTopics"
        component={PollTopicsScreen}
      />

      <Stack.Screen
        name="SwipePoll"
        component={SwipePollScreen}
        // Prevents swiping of screen for swipe polls 
        options={{ gestureEnabled: false,}}
      />
    </Stack.Navigator>
  );
}