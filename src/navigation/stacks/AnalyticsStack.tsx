import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { IconButton, useTheme } from "react-native-paper";
import AnalyticsScreen from "../../screens/Analytics/AnalyticsScreen";
import { DrawerActions, useNavigation } from "@react-navigation/native";

const Stack = createNativeStackNavigator();

export default function AnalyticsStack() {
  const theme = useTheme();
  const navigation = useNavigation();
  
  return (
    <Stack.Navigator
      screenOptions={{
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