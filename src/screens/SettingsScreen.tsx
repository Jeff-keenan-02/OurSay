// src/screens/SettingsScreen.tsx
import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function SettingsScreen() {
  const { logout, user } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Logged in as:</Text>
        <Text style={styles.username}>{user?.username}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#eef2ff" },

  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 30,
  },

  infoBox: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 40,
    elevation: 2,
  },

  label: { fontSize: 14, color: "#555" },
  username: { fontSize: 18, fontWeight: "600", marginTop: 4 },

  logoutButton: {
    backgroundColor: "#d32f2f",
    paddingVertical: 14,
    borderRadius: 10,
  },
  logoutText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});