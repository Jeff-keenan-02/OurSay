import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme, IconButton } from "react-native-paper";
import CreateMenuScreen from "../../screens/Create/CreateMenuScreen";
import CreateDiscussionScreen from "../../screens/Create/CreateDiscussionScreen";
import CreatePetitionScreen from "../../screens/Create/CreatePetitionScreen";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import { tierHeaderRight } from "../headerOptions";


const Stack = createNativeStackNavigator();

export default function CreateStack({ navigation }: any) {
  const theme = useTheme();
  const {user} = useContext(AuthContext);
  return (
    <Stack.Navigator
      screenOptions={{
        ...(user
    ? tierHeaderRight({
        tier: user.verification_level,
        onPress: () =>
          navigation.navigate("Main", { screen: "Verify" }),
      })
    : {}),

        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.onBackground,
        headerTitleStyle: { fontWeight: "bold" },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="CreateMenu"
        component={CreateMenuScreen}
        options={{
          title: "Create",
          headerLeft: () => (
            <IconButton
              icon="menu"
              onPress={() => navigation.getParent()?.openDrawer()}
            />
          ),
        }}
      />

      <Stack.Screen
        name="CreateDiscussion"
        component={CreateDiscussionScreen}
        options={{ title: "New Discussion" }}
      />

      <Stack.Screen
        name="CreatePetition"
        component={CreatePetitionScreen}
        options={{ title: "New Petition" }}
      />
    </Stack.Navigator>
  );
}