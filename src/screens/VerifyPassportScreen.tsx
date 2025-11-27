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
    <Screen center scroll title="Identity Verification" subtitle="Upload a clear photo of your passport information page.">
      <Section>
        <Card
          mode="elevated"
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content style={{ alignItems: "center" }}>
            <Avatar.Icon
              size={80}
              icon="passport"
              style={styles.icon}
              color="white"
            />

            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
              Passport Verification
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: theme.colors.onSurfaceVariant }
              ]}
            >
              Upload the page with the MRZ clearly visible.
            </Text>

            {!photo && !loading && (
              <Button mode="contained" onPress={choosePhoto} style={styles.btn}>
                Choose Passport Photo
              </Button>
            )}

            {photo && (
              <>
                <Image source={{ uri: photo.uri }} style={styles.preview} />

                {!loading && (
                  <Button
                    mode="contained"
                    onPress={uploadPassport}
                    style={styles.btn}
                  >
                    Upload to Verify
                  </Button>
                )}
              </>
            )}

            {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
          </Card.Content>
        </Card>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingVertical: 16,
  },
  icon: {
    backgroundColor: "#3949ab",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  btn: {
    width: "80%",
    marginTop: 12,
    borderRadius: 10,
  },
  preview: {
    width: 260,
    height: 260,
    borderRadius: 12,
    marginVertical: 16,
  },
});