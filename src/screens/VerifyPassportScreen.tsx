// screens/VerifyPassportScreen.tsx
import React, { useContext } from "react";
import { StyleSheet, Image, View } from "react-native";
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Avatar,
  useTheme,
} from "react-native-paper";

import { AuthContext } from "../context/AuthContext";
import { globalStyles } from "../styles/globalStyles"; // make sure this path matches your project
import { usePassportVerification } from "../hooks/verify/usePassportVerification";
import { Screen } from "../layout/Screen";
import { Section } from "../layout/Section";

export default function VerifyPassportScreen() {
  const theme = useTheme();
  const { user, login } = useContext(AuthContext);
  const API = "http://localhost:3000";

  const {
    photo,
    loading,
    choosePhoto,
    uploadPassport,
  } = usePassportVerification(API, user, login);

 return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {/* Page Title */}
      <Text
        style={[
          styles.title,
          { color: theme.colors.onBackground },
        ]}
      >
        Verify Your Identity
      </Text>

      <Text
        style={[
          styles.subtitle,
          { color: theme.colors.onSurfaceVariant },
        ]}
      >
        Upload a clear photo of the passport information page.
      </Text>

      {/* Main Card */}
      <Card
        mode="elevated"
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Card.Content style={styles.cardContent}>
          {/* Icon with ring */}
          {!photo && (
            <View
              style={[
                styles.iconWrapper,
                { borderColor: theme.colors.primary },
              ]}
            >
              <Avatar.Icon
                size={66}
                icon="passport"
                color="white"
                style={[
                  styles.icon,
                  { backgroundColor: theme.colors.primary },
                ]}
              />
            </View>
          )}

          {/* Title inside card */}
          <Text
            style={[
              styles.cardTitle,
              { color: theme.colors.onSurface },
            ]}
          >
            Passport Photo
          </Text>

          <Text
            style={[
              styles.cardSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Make sure the MRZ (bottom text) is clearly visible.
          </Text>

          {/* Image Preview */}
          {photo && (
            <Image
              source={{ uri: photo.uri }}
              style={styles.preview}
            />
          )}

          {/* Buttons */}
          {!loading && (
            <Button
              mode="contained"
              onPress={photo ? uploadPassport : choosePhoto}
              style={styles.button}
            >
              {photo ? "Upload to Verify" : "Choose Passport Photo"}
            </Button>
          )}

          {loading && (
            <ActivityIndicator size="large" style={{ marginTop: 20 }} />
          )}
        </Card.Content>
      </Card>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 22,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  card: {
    width: "94%",
    borderRadius: 18,
    paddingVertical: 20,
  },
  cardContent: {
    alignItems: "center",
    paddingHorizontal: 10,
  },
  iconWrapper: {
    padding: 8,
    borderWidth: 2,
    borderRadius: 60,
    marginBottom: 14,
  },
  icon: {
    backgroundColor: "#3a7bfe",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    width: "85%",
    marginTop: 10,
    borderRadius: 10,
  },
  preview: {
    width: 260,
    height: 260,
    borderRadius: 12,
    marginVertical: 14,
  },
});