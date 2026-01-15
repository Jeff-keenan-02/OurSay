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
import { AuthContext } from "../../context/AuthContext";
import { usePassportVerification } from "../../hooks/verify/usePassportVerification";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { spacing } from "../../theme/spacing";
import { useNavigation } from "@react-navigation/native";

export default function PassportCaptureScreen(){
  const theme = useTheme();
  const { user, login } = useContext(AuthContext);
  const API = "http://localhost:3000";
  const navigation = useNavigation();

  const {
    photo,
    loading,
    choosePhoto,
    uploadPassport,
  } = usePassportVerification(API, user, login);

   return (
    <Screen
      scroll
      title="Verify Identity"
      subtitle="Upload a clear photo of your passport information page."
    >
      <Section>
        <Card
          mode="elevated"
          style={[
            styles.card,
            { backgroundColor: theme.colors.surface }
          ]}
        >
          <Card.Content style={styles.cardContent}>
            
            {/* Icon Circle */}
            {!photo && (
              <View
                style={[
                  styles.iconWrapper,
                  { borderColor: theme.colors.primary }
                ]}
              >
                <Avatar.Icon
                  size={70}
                  icon="passport"
                  color="white"
                  style={[
                    styles.icon,
                    { backgroundColor: theme.colors.primary }
                  ]}
                />
              </View>
            )}

            {/* Card Title */}
            <Text
              variant="titleMedium"
              style={[
                styles.cardTitle,
                { color: theme.colors.onSurface }
              ]}
            >
              Passport Upload
            </Text>

            <Text
              variant="bodyMedium"
              style={[
                styles.cardSubtitle,
                { color: theme.colors.onSurfaceVariant }
              ]}
            >
              Ensure the MRZ (the machine-readable text at the bottom) is visible.
            </Text>

            {/* Photo Preview */}
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
                {photo ? "Upload & Verify" : "Choose Passport Photo"}
              </Button>
            )}

            {loading && (
              <ActivityIndicator size="large" style={{ marginTop: spacing.md }} />
            )}
          </Card.Content>
        </Card>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    paddingVertical: spacing.lg,
  },
  cardContent: {
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  iconWrapper: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 60,
    marginBottom: spacing.md,
  },
  icon: {
    backgroundColor: "#3a7bfe",
  },
  cardTitle: {
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  button: {
    width: "90%",
    borderRadius: 12,
    marginTop: spacing.md,
  },
  preview: {
    width: 260,
    height: 260,
    borderRadius: 14,
    marginBottom: spacing.md,
  },
});

