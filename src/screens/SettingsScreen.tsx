import React, { useContext } from "react";
import { StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";

import {
  Text,
  Card,
  Button,
  List,
  Avatar,
  Divider,
  useTheme,
} from "react-native-paper";

import { Screen } from "../layout/Screen";
import { Section } from "../layout/Section";

export default function SettingsScreen() {
  const theme = useTheme();
  const { logout, user } = useContext(AuthContext);

  return (
    <Screen
      title="Settings"
      subtitle="Manage your account and preferences."
    >
      {/* --- USER CARD --- */}
      <Section label="Your Account">
        <Card
          mode="elevated"
          style={styles.card}
          theme={{ colors: { surface: theme.colors.surface } }}
        >
          <Card.Title
            title="Logged in as"
            titleStyle={[styles.cardTitle, { color: theme.colors.onSurface }]}
            left={(props) => (
              <Avatar.Icon
                {...props}
                icon="account"
                size={48}
                color={theme.colors.onPrimary}
                style={styles.avatar}
              />
            )}
          />

          <Text
            style={[
              styles.username,
              { color: theme.colors.onSurfaceVariant }
            ]}
          >
            {user?.username}
          </Text>
        </Card>
      </Section>

      {/* --- ACCOUNT DETAILS --- */}
      <Section label="Account Details">
        <List.Item
          title="Verification Status"
          description={user?.identity_token ? "Verified User" : "Not Verified"}
          left={(props) => (
            <List.Icon
              {...props}
              color={user?.identity_token ? "#4caf50" : "#ff9800"}
              icon={user?.identity_token ? "shield-check" : "shield-alert"}
            />
          )}
        />
      </Section>

      {/* --- APPEARANCE --- */}
      <Section label="Appearance">
        <List.Item
          title="Theme"
          description="Neo Dark"
          left={(props) => (
            <List.Icon {...props} color="#90caf9" icon="palette" />
          )}
        />
      </Section>

      {/* --- SIGN OUT --- */}
      <Section>
        <Button
          mode="contained"
          onPress={logout}
          style={styles.logoutButton}
          buttonColor="#b54949"
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
  logoutButton: {
    borderRadius: 10,
    paddingVertical: 8,
    marginTop: 20,
  },
});