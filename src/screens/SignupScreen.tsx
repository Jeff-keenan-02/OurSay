import React, { useState, useContext } from "react";
import { View, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { globalStyles } from "../theme/globalStyles";
import { useTheme } from "react-native-paper";

import {
  Text,
  TextInput,
  Button,
  Card,
  Avatar,
} from "react-native-paper";

export default function SignupScreen() {
  const navigation: any = useNavigation();
  const { login } = useContext(AuthContext);
  const theme = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignup = async () => {
    try {
      const res = await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Signup failed");
        return;
      }

      login(data.user);
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error");
    }
  };

  return (
    <View style={[globalStyles.screenCenter, { backgroundColor: theme.colors.background }]}>

      {/* Branding Icon */}
      <Avatar.Icon
        size={84}
        icon="account-plus"
        color={theme.colors.primary} 
        style={styles.icon}
      />

      {/* App Title */}
       <Text
         variant="headlineLarge"
         // 2. Use the theme's onBackground color for high contrast text
         style={[styles.title, { color: theme.colors.onBackground }]} 
       >
         OurSay
      </Text>

      {/* Subtitle */}
        <Text
          variant="bodyMedium"
          // 3. Use the theme's muted color for secondary text
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
        Create an account to take part in verified discussions
      </Text>

      {/* Signup Card */}
      {/* Login Card (Card uses theme.colors.surface automatically) */}
          <Card 
            mode="elevated" 
            style={[
              { backgroundColor: theme.colors.surface }, 
              styles.SignupCard // <--- ADD THIS CUSTOM STYLE
            ]}
          >
            <Card.Title
              title="Sign Up"
              // 4. Use the theme's onSurface color for the card title
              titleStyle={[styles.cardTitle, { color: theme.colors.onSurface }]}
            />
    
            <Card.Content>
              {errorMsg ? (
                <Text style={[globalStyles.error, { color: theme.colors.error }]}>
                  {errorMsg}
                </Text>
              ) : null}
    
              <TextInput
                // TextInput will automatically use theme.colors.surfaceVariant
                mode="outlined"
                label="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
              {/* ... Password Input ... */}
              <TextInput
                mode="outlined"
                label="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <Button
                  mode="contained"
                  onPress={handleSignup}
                >
                  Sign Up
                </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate("Login")}
            style={styles.link}
          >
            Already have an account? Log in
          </Button>

        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
// 5. Remove all color rules from the StyleSheet.create block
  icon: {
    backgroundColor: "transparent",
    marginBottom: 10,
  },
  title: {
    textAlign: "center",
    marginTop: 4,
    fontWeight: "bold",
    // Color removed
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 20,
    // Color removed
  },
  cardTitle: {
    textAlign: "center",
    fontSize: 24,

  },
  link: {
    marginTop: 6,
  },
  scrollContent: {
    flexGrow: 1, // Allows content to take up full screen height
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center',    // Centers content horizontally
    paddingVertical: 20,     // Ensures padding at top/bottom of scrollable area
  },
    SignupCard: {
    // This constrains the card width to 90% of the screen
    width: '90%', 
    // This allows it to look good on tablets/larger screens
    maxWidth: 400, 
    padding: 10, // Add some padding around the content
    // Remove vertical margin since it's centered
  },
});