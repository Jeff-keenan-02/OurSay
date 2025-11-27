import React, { useContext, useState } from "react";
import { StyleSheet, Image, View } from "react-native";
import * as ImagePicker from "react-native-image-picker";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// await AsyncStorage.clear();
import { Alert } from "react-native";

import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Avatar,
  useTheme
} from "react-native-paper";

import { globalStyles } from "../theme/globalStyles";
import { AuthContext } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

type PhotoAsset = {
  uri: string;
  type?: string;
  fileName?: string;
};

export default function VerifyPassportScreen() {
  const theme = useTheme();
  const [photo, setPhoto] = useState<PhotoAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const { user , login} = useContext(AuthContext);
  const API = "http://localhost:3000";

  const choosePhoto = () => {
    ImagePicker.launchImageLibrary({ mediaType: "photo" }, (response) => {
      if (response.didCancel) return;

      const asset = response?.assets?.[0];
      if (asset?.uri) {
        setPhoto({
          uri: asset.uri,
          type: asset.type,
          fileName: asset.fileName,
        });
      }
    });
  };

  const uploadPassport = async () => {
    if (!photo || !photo.uri) {
      Alert.alert("Please choose a passport image first.");
      return;
    }

    setLoading(true);

    try {
        let fixedUri = photo.uri;
      if (!fixedUri.startsWith("file://")) {
        fixedUri = fixedUri.replace("ph://", "file://");
      }
      const data = new FormData();
      data.append("file", {
        uri: fixedUri,
        type: photo.type ?? "image/jpeg",
        name: photo.fileName ?? "passport.jpg",
      });

      if (!user || user.id == null) {
        Alert.alert("No authenticated user — please sign in and try again.");
        setLoading(false);
        return;
      }

      data.append("userId", user.id.toString());
      const response = await fetch(
        `${API}/verify-passport`,
        {
          method: "POST",
          body: data,
        }
      );

      const json = await response.json();
      console.log("VERIFY RESPONSE:", json);

      if (response.ok && json.verified) {                        
        Alert.alert("✅ Identity verified");

        // Clear stored user data to force refresh
        await AsyncStorage.removeItem("user");

        // Update AuthContext with the new identity token
        if (user) {
          const updatedUser = {
            id: user.id,
            username: user.username,
            identity_token: json.identity_token.toString()
          };
          await login(updatedUser);
        }

      } else {
        Alert.alert("Verification failed.\n" + (json.error || "Unknown error"));
      }
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      Alert.alert("Network Error — Unable to send image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
  style={[
    globalStyles.screenCenter,
    { backgroundColor: theme.colors.background }
  ]}
>
<Text style={globalStyles.heading}>Identity Verification</Text>
<Text style={[globalStyles.subheading, { width: "80%" }]}>
  Upload a clear photo of the passport information page so the MRZ can be read.
</Text>
    <Card
      mode="flat"
      style={[styles.card, { borderColor: theme.colors.outline }]}
      theme={{ roundness: 18 }}
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

          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Upload the passport photo page with the MRZ visible.
          </Text>

          {!photo && !loading && (
            <Button
              mode="contained"
              onPress={choosePhoto}
              style={styles.chooseBtn}
            >
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
                  style={styles.uploadBtn}
                >
                  Upload to Verify
                </Button>
              )}
            </>
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
  card: {
    width: "88%",
    paddingVertical: 20,
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
  },
  icon: {
    backgroundColor: "#3949ab",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#e0e0e0",
    textAlign: "center",
  },
  subtitle: {
    color: "#b0b0b0",
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  preview: {
    width: 260,
    height: 260,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 16,
  },
  chooseBtn: {
    width: "80%",
    borderRadius: 10,
    marginTop: 10,
  },
  uploadBtn: {
    width: "80%",
    borderRadius: 10,
    marginTop: 12,
  },
});


