// hooks/verify/usePassportVerification.ts
import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

type PhotoAsset = {
  uri: string;
  type?: string;
  fileName?: string;
};

type User = {
  id: number;
  username: string;
  identity_token?: string | null;
};

type UsePassportVerificationResult = {
  photo: PhotoAsset | null;
  loading: boolean;
  choosePhoto: () => void;
  uploadPassport: () => Promise<void>;
  clearPhoto: () => void;
};

export function usePassportVerification(
  API: string,
  user: User | null,
  login: (user: User) => void
): UsePassportVerificationResult {
  const [photo, setPhoto] = useState<PhotoAsset | null>(null);
  const [loading, setLoading] = useState(false);

  // Pick an image from gallery
  const choosePhoto = () => {
    ImagePicker.launchImageLibrary(
      { mediaType: "photo" },
      (response) => {
        if (response.didCancel) return;

        const asset = response?.assets?.[0];
        if (asset?.uri) {
          setPhoto({
            uri: asset.uri,
            type: asset.type,
            fileName: asset.fileName,
          });
        }
      }
    );
  };

  const clearPhoto = () => {
    setPhoto(null);
  };

  const uploadPassport = async () => {
    if (!photo || !photo.uri) {
      Alert.alert("Please choose a passport image first.");
      return;
    }

    if (!user || user.id == null) {
      Alert.alert("No authenticated user — please sign in and try again.");
      return;
    }

    setLoading(true);

    try {
      // Normalise iOS URI shape if needed
      let fixedUri = photo.uri;
      if (!fixedUri.startsWith("file://")) {
        fixedUri = fixedUri.replace("ph://", "file://");
      }

      const data = new FormData();
      data.append("file", {
        uri: fixedUri,
        type: photo.type ?? "image/jpeg",
        name: photo.fileName ?? "passport.jpg",
      } as any);

      data.append("userId", user.id.toString());

      const response = await fetch(`${API}/verify-passport`, {
        method: "POST",
        body: data,
      });

      const json = await response.json();
      console.log("VERIFY RESPONSE:", json);

      if (response.ok && json.verified) {
        Alert.alert("✅ Identity verified");

        // Clear cached user so it doesn’t conflict with updated one
        await AsyncStorage.removeItem("user");

        const updatedUser: User = {
          id: user.id,
          username: user.username,
          identity_token: json.identity_token?.toString(),
        };

        // Update AuthContext with fresh user
        await login(updatedUser);

      } else {
        Alert.alert(
          "Verification failed.",
          json.error ? String(json.error) : "Unknown error"
        );
      }
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      Alert.alert("Network Error", "Unable to send image.");
    } finally {
      setLoading(false);
    }
  };

  return {
    photo,
    loading,
    choosePhoto,
    uploadPassport,
    clearPhoto,
  };
}