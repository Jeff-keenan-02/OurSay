import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { IconButton, useTheme } from "react-native-paper";

import PetitionListScreen from "../../screens/Petitions/PetitionListScreen";
import { DrawerActions, useNavigation } from "@react-navigation/native";

const Stack = createNativeStackNavigator();

export default function PetitionStack() {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.onBackground,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="PetitionList"
        component={PetitionListScreen}
        options={{ title: "Petitions",
                      headerLeft: () => (
            <IconButton
              icon="menu"
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
}