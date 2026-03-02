// screens/Verify/LivenessCaptureScreen.tsx

import React, { useState, useContext } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Button, Text, ActivityIndicator } from "react-native-paper";
import * as ImagePicker from "react-native-image-picker";

import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { AuthContext } from "../../context/AuthContext";
import { useApiClient } from "../../hooks/common/useApiClient";
import { VerificationResponse } from "../../types/VerificationType";

export default function LivenessCaptureScreen() {
  const { user, updateUser } = useContext(AuthContext);
  const api = useApiClient();
  const [uploading, setUploading] = useState(false);

  /* -------------------------------------------------
     Capture Selfie (Front Camera)
  --------------------------------------------------*/
  const captureSelfie = () => {
    if (!user) {
      Alert.alert("You must be logged in");
      return;
    }

    ImagePicker.launchCamera(
      {
        mediaType: "photo",
        cameraType: "front",
        saveToPhotos: false,
        includeBase64: false,
        quality: 0.8,
      },
      async (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert(response.errorMessage ?? "Camera error");
          return;
        }

        const asset = response.assets?.[0];
        if (!asset?.uri) {
          Alert.alert("No image captured");
          return;
        }

        try {
          setUploading(true);

          const form = new FormData();
          form.append("file", {
            uri: asset.uri,
            type: asset.type ?? "image/jpeg",
            name: asset.fileName ?? "selfie.jpg",
          } as any);

        const data = await api.post<VerificationResponse>(
          "/verify/liveness",
          form
        );

          updateUser({ verification_tier: data.level });
          Alert.alert("✅ Liveness verified");

        } catch (err: any) {
          Alert.alert(err.message || "Liveness failed");
        } finally {
          setUploading(false);
        }
      }
    );
  };
  /* -------------------------------------------------
     Render
  --------------------------------------------------*/

  return (
    <Screen showBack title="Liveness Check">
      <Section>
        <Text variant="titleMedium">
          Take a clear selfie to verify your identity
        </Text>

        {uploading && (
          <ActivityIndicator style={{ marginVertical: 16 }} />
        )}

        <Button
          mode="contained"
          onPress={captureSelfie}
          disabled={uploading}
        >
          Take Selfie
        </Button>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cameraBox: {
    height: 320,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
    marginBottom: 20,
  },
});