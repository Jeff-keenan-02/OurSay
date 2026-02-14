import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SwipePollScreen from "../../screens/Polls/SwipePollScreen";
import PollHomeScreen from "../../screens/Polls/PollHomeScreen";
import PollListScreen from "../../screens/Polls/PollListScreen";


const Stack = createNativeStackNavigator();

export default function PollStack() {


  return (
    <Stack.Navigator
      screenOptions={{        
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="PollHome"
        component={PollHomeScreen}
      />

        <Stack.Screen
        name="PollList"
        component={PollListScreen}
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