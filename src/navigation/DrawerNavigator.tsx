import { createDrawerNavigator } from "@react-navigation/drawer";
import { IconButton } from "react-native-paper";
import AppNavigator from "./AppNavigator";
import CustomDrawerContent from "./CustomDrawerContent";
import { useTheme } from "react-native-paper";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { TierBadge } from "../components/common/TierBadge";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  return (
    <Drawer.Navigator
      drawerContent={CustomDrawerContent}
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: theme.colors.background },

        headerLeft: () => (
          <IconButton
            icon="menu"
            onPress={() => navigation.openDrawer()}
          />
        ),

        headerRight: () =>
          user ? (
            <TierBadge
              tier={user.verification_tier}
              onPress={() =>
                navigation.navigate("Tabs", { screen: "Verify" })
              }
            />
          ) : null,
      })}
    >
      <Drawer.Screen
        name="Tabs"
        component={AppNavigator}
        options={{ title: "OurSay" }}
      />
    </Drawer.Navigator>
  );
}