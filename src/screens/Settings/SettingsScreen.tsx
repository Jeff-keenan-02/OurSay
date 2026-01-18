import React, { useContext } from "react";
import { StyleSheet } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { useThemeMode } from "../../context/ThemeModeContext";

import {
  Text,
  Card,
  Button,
  List,
  Switch,
  Avatar,
  useTheme,
} from "react-native-paper";

import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";

export default function SettingsScreen() {
  const theme = useTheme();
  const { logout, user } = useContext(AuthContext);

  const { mode, setMode } = useThemeMode();
  const isDark = mode === "dark";
  const themeLabel = mode === "system" ? "System" : isDark ? "Dark" : "Light";

  return (
    <Screen>
      {/* --- USER CARD --- */}
      <Section label="Your Account">
        <List.Item
            title={`Logged in as ${user?.username}`}
            left={(props) => (
              <List.Icon
                {...props}
                icon="account"
                style={styles.avatar}
              />
            )}
          />
      </Section>

      {/* --- ACCOUNT DETAILS --- */}
      <Section label="Account Details">
        <List.Item
          title="Verification Status"
          description={user?.verification_level ? "Verified User" : "Not Verified"}
          left={(props) => (
            <List.Icon
              {...props}
              color={user?.verification_level ? "#4caf50" : "#ff9800"}
              icon={user?.verification_level ? "shield-check" : "shield-alert"}
            />
          )}
        />
      </Section>

      {/* --- APPEARANCE --- */}
      <Section label="Appearance">
        <List.Item
          title="Theme"
          description={themeLabel}
          left={(props) => (
            <List.Icon {...props} color="#90caf9" icon="palette" />
          )}
        />
        <Switch
              value={isDark}
              onValueChange={(value) => setMode(value ? "dark" : "light")}
            />
      </Section>

      {/* --- SIGN OUT --- */}
      <Section>
        <Button
          mode="contained"
          onPress={logout}
          buttonColor={theme.colors.error}
        >
          Sign Out
        </Button>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    paddingVertical: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  avatar: {
    backgroundColor: "#3949ab",
  },
  username: {
    fontSize: 17,
    marginTop: 8,
    marginLeft: 16,
  },
});