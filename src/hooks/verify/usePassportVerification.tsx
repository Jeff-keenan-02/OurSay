import { useState } from "react";
import { Alert, Platform } from "react-native";
import * as ImagePicker from "react-native-image-picker";
import { PhotoAsset } from "../../types/Media";
import { User } from "../../types/User";
import { VerificationResponse } from "../../types/Verification";

type UsePassportVerificationResult = {
  photo: PhotoAsset | null;
  loading: boolean;
  capturePassport: () => void;
  uploadPassport: () => Promise<void>;
  clearPhoto: () => void;
};

export function usePassportVerification(
  API: string,
  user: User | null,
  updateUser: (partial: Partial<User>) => void
): UsePassportVerificationResult {
  const [photo, setPhoto] = useState<PhotoAsset | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * 📸 Open camera ONLY (no gallery)
   */
  const capturePassport = () => {
    ImagePicker.launchCamera(
      {
        mediaType: "photo",
        cameraType: "back",
        saveToPhotos: false,
        includeBase64: false,
        quality: 0.9,
      },
      (response) => {
        if (response.didCancel) return;

        if (response.errorCode) {
          Alert.alert("Camera error", response.errorMessage ?? "Unknown error");
          return;
        }

        const asset = response.assets?.[0];
        if (!asset?.uri) {
          Alert.alert("Capture failed", "No image was captured");
          return;
        }

        setPhoto({
          uri: asset.uri,
          type: asset.type ?? "image/jpeg",
          fileName: asset.fileName ?? "passport.jpg",
        });
      }
    );
  };

  const clearPhoto = () => setPhoto(null);

  /**
   * 🚀 Upload passport to backend for verification
   */
  const uploadPassport = async () => {
    if (!photo || !user) {
      Alert.alert("Missing data", "Please capture a passport photo first");
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();

      form.append("file", {
        uri: photo.uri,
        type: photo.type,
        name: photo.fileName,
      } as any);

      form.append("userId", user.id.toString());

      const res = await fetch(`${API}/verify/verify-passport`, {
        method: "POST",
        body: form,
      });

      const data: VerificationResponse = await res.json();

      if (!res.ok || !data.verified) {
        Alert.alert("Verification failed", "Could not verify passport");
        return;
      }

      // ✅ Update only verification state
      updateUser({ verification_level: data.level });

      Alert.alert("✅ Passport verified");
      clearPhoto();
    } catch (err) {
      console.error(err);
      Alert.alert("Network error", "Could not contact verification service");
    } finally {
      setLoading(false);
    }
  };

  return {
    photo,
    loading,
    capturePassport,
    uploadPassport,
    clearPhoto,
  };
}