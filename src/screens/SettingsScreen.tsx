import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { globalStyles } from "../theme/globalStyles";

import {
  Text,
  Card,
  Button,
  List,
  Avatar,
  Divider,
  useTheme,
} from "react-native-paper";

export default function SettingsScreen() {
  const { logout, user } = useContext(AuthContext);
  const theme = useTheme();

  return (
<View
  style={[
    globalStyles.screen,
    { backgroundColor: theme.colors.background }
  ]}
>
      
      {/* Header */}
      <Text style={globalStyles.heading}>Settings</Text>
      <Text style={[globalStyles.subheading, { marginBottom: 30 }]}>
        Manage your account and preferences.
      </Text>

      {/* User Info Card */}
      <Card
        mode="elevated"
        style={[styles.card, globalStyles.card]}
        theme={{ colors: { surface: theme.colors.surface } }}
      >
        <Card.Title
          title="Logged In As:"
          titleStyle={[styles.cardTitle, { color: theme.colors.onSurface }]}
          left={(props) => (
            <Avatar.Icon
              {...props}
              icon="account"
              size={48}
              color="#ffffff"
              style={styles.avatar}
            />
          )}
        />
     
      </Card>
              {/* Logout Button */}
          <Button
            mode="contained"
            style={styles.logoutButton}
            buttonColor="#cc7744"
          >
          <Text style={styles.username}>{user?.username}</Text>
          </Button>
         
    

      {/* Settings List */}
      <List.Section>
        <List.Subheader style={styles.subheaderText}>
          Account Details
        </List.Subheader>

        <List.Item
          title="Verification Status"
          titleStyle={{ color: theme.colors.onSurface }}
          description={user?.identity_token ? "Verified User" : "Not Verified"}
          descriptionStyle={{
            color: user?.identity_token ? "#8dfc8d" : "#ffae63",
          }}
          left={(props) => (
            <List.Icon
              {...props}
              color={user?.identity_token ? "#4caf50" : "#ff9800"}
              icon={user?.identity_token ? "shield-check" : "shield-alert"}
            />
          )}
        />

        <Divider style={styles.divider} />

        <List.Subheader style={styles.subheaderText}>
          Appearance
        </List.Subheader>

        <List.Item
          title="Theme"
          titleStyle={{ color: theme.colors.onSurface }}
          description="Neo Dark"
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={(props) => (
            <List.Icon {...props} color="#90caf9" icon="palette" />
          )}
        />
      </List.Section>

      {/* Logout Button */}
      <Button
        mode="contained"
        onPress={logout}
        style={styles.logoutButton}
        buttonColor="#b54949"
      >
        Sign Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 25,
    borderRadius: 18,
    paddingVertical: 4,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  avatar: {
    backgroundColor: "#3949ab",
  },

  username: {
    color: "#c2c2c2",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 5,
  },

  subheaderText: {
    color: "#aaaaaa",
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 4,
  },

  divider: {
    marginVertical: 12,
    backgroundColor: "#3b3b3b",
  },

  logoutButton: {
    marginTop: 30,
    borderRadius: 10,
    paddingVertical: 8,
  },
});