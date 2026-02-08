import React from "react";
import { View, StyleSheet } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import { Text, Divider, useTheme } from "react-native-paper";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function CustomDrawerContent(props: any) {
  const theme = useTheme();
  const { logout, user } = useContext(AuthContext);

  return (
    <DrawerContentScrollView {...props}>
      {/* Header */}
      <View>
        <Text variant="titleLarge">OurSay</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
          {user && 'verified' in user && user.verified ? "Verified Citizen ✓" : "Unverified User"}
        </Text>
      </View>
      <Divider />

      <DrawerItem
        label="Analytics"
        onPress={() => {
          props.navigation.navigate("Tabs", {
            screen: "Analytics",
          });
          props.navigation.closeDrawer();
        }}
      />

      <DrawerItem
        label="Settings"
        onPress={() => {
          props.navigation.navigate("Tabs", {
            screen: "Settings",
          });
          props.navigation.closeDrawer();
        }}
      />
      <DrawerItem
            label="Verify Identity"
            onPress={() => {
              props.navigation.navigate("Tabs", { screen: "Verify" });
              props.navigation.closeDrawer();
            }}
          />

      <Divider />

      <DrawerItem
        label="Log out"
        onPress={logout}
        labelStyle={{ color: theme.colors.error }}
      />
    </DrawerContentScrollView>
  );
}