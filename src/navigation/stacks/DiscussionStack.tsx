import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {useTheme } from "react-native-paper"; 
import DiscussionsListScreen from "../../screens/Discussions/DiscussionListScreen";
import DiscussionDetailScreen from "../../screens/Discussions/DiscussionDetailScreen";
import DiscussionCategoriesScreen from "../../screens/Discussions/DiscussionCategoriesScreen";



const Stack = createNativeStackNavigator();

export default function DiscussionStack() {
  return (
    <Stack.Navigator
       screenOptions={{        
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="DiscussionCategories"
        component={DiscussionCategoriesScreen}
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