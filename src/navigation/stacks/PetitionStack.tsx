import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { IconButton, useTheme } from "react-native-paper";

import PetitionListScreen from "../../screens/Petitions/PetitionListScreen";
import { DrawerActions, useNavigation } from "@react-navigation/native";

import { PetitionStackParamList } from "../types/PetitionStackParamList";
import PetitionDetailScreen from "../../screens/Petitions/PetitionDetailScreen";
import PetitionCategoryScreen from "../../screens/Petitions/PetitionCategoriesScreen";

const Stack = createNativeStackNavigator<PetitionStackParamList>();

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
        name="PetitionCategory"
        component={PetitionCategoryScreen}
        options={{ title: "Petitions Categories",
                      headerLeft: () => (
            <IconButton
              icon="menu"
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            />
          ),
        }}
      />

      <Stack.Screen
        name="PetitionList"
        component={PetitionListScreen}
        options={{ title: "All Petitions" }}
      />

      <Stack.Screen
        name="PetitionDetail"
        component={PetitionDetailScreen}
        options={{ title: "Petition" }}
      />
    </Stack.Navigator>
  );
}