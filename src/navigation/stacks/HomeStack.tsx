import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../../screens/Home/HomeScreen";
import { useTheme } from "react-native-paper"; 
import DiscussionCategoriesScreen from "../../screens/Discussions/discussionCategoriesScreen";
const Stack = createNativeStackNavigator();

export default function HomeStack() {
const theme = useTheme();
  return (
<Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,     // removes the faint white line
        headerTransparent: false,  

        headerStyle: {
          backgroundColor: theme.colors.background, // Matches screen background
        },
        headerTintColor: theme.colors.onBackground,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        // Set the background of the screen container itself
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{
        title: "Home",

        }}
      />
    </Stack.Navigator>
  );
}