import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useTheme } from "react-native-paper";

import AppNavigator from "./AppNavigator";
import SettingsStack from "./stacks/SettingsStack";
import CustomDrawerContent from "./CustomDrawerContent";
import AnalyticsStack from "./stacks/AnalyticsStack";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const theme = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: "75%",
          backgroundColor: theme.colors.surface,
        },
      }}
    >
      {/* Main app (tabs) */}
      <Drawer.Screen name="Home" component={AppNavigator} />

      {/* Drawer-only screens */}
      <Drawer.Screen name="Analytics" component={AnalyticsStack} />
      <Drawer.Screen name="Settings" component={SettingsStack} />
    </Drawer.Navigator>
  );
}