import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../../screens/Home/HomeScreen";
import { IconButton, useTheme } from "react-native-paper"; 
import DiscussionCategoriesScreen from "../../screens/Discussions/DiscussionCategoriesScreen";
import { tierHeaderRight } from "../headerOptions";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
const Stack = createNativeStackNavigator();

export default function HomeStack({navigation}: any) {
const theme = useTheme();
const { user } = useContext(AuthContext);
  return (
    
<Stack.Navigator
      screenOptions={{
        headerShadowVisible: false, // removes the faint white line
        headerTransparent: false,  

             ...(user
          ? tierHeaderRight({
              tier: user.verification_level,
              onPress: () =>
                navigation.navigate("Main", { screen: "Verify" }),
            })
          : {}),
          
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
        headerLeft: () => (
          <IconButton
            icon="menu"
            onPress={() => navigation.getParent()?.openDrawer()}
          />
        ),

        }}
      />
    </Stack.Navigator>
  );
}