import React, { useContext } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useTheme } from "react-native-paper";
import AppNavigator from "./AppNavigator";
import CustomDrawerContent from "./CustomDrawerContent";
import { AuthContext } from "../context/AuthContext";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* MAIN APP (tabs always visible) */}
      <Drawer.Screen
        name="Main"
        component={AppNavigator}
      />
    </Drawer.Navigator>
  );
}