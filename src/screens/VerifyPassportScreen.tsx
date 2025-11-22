import React, { useState } from "react";
import { StyleSheet, Image, View } from "react-native";
import * as ImagePicker from "react-native-image-picker";

import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Avatar,
  useTheme
} from "react-native-paper";

import { globalStyles } from "../theme/globalStyles";

type PhotoAsset = {
  uri: string;
  type?: string;
  fileName?: string;
};

export default function VerifyPassportScreen() {
  const [photo, setPhoto] = useState<PhotoAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

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
    if (!photo?.uri) {
      alert("Please choose a passport image first.");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("file", {
        uri: photo.uri,
        type: "image/jpeg",
        name: photo.fileName ?? "passport.jpg",
      } as any);

      const response = await fetch(
        "https://europe-west1-oursay.cloudfunctions.net/scanPassport",
        {
          method: "POST",
          headers: { "Content-Type": "multipart/form-data" },
          body: data,
        }
      );

      const json = await response.json();

      if (json.ok) {
        alert("MRZ Read:\n" + JSON.stringify(json.mrz, null, 2));
      } else {
        alert("OCR Failed:\n" + (json.error || "Unknown error"));
      }
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Network Error — Unable to send image.");
    }

    setLoading(false);
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

function alert(arg0: string) {
  throw new Error("Function not implemented.");
}
