import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { IconButton, useTheme } from "react-native-paper";
import AnalyticsScreen from "../../screens/Analytics/AnalyticsScreen";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import { tierHeaderRight } from "../headerOptions";

const Stack = createNativeStackNavigator();

export default function AnalyticsStack() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext); 
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
              
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.onBackground,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="AnalyticsMain"
        component={AnalyticsScreen}
        options={{
          title: "Analytics",
          headerLeft: () => (
            <IconButton
              icon="menu"
              onPress={() =>
                navigation.dispatch(DrawerActions.openDrawer())
              }
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
}