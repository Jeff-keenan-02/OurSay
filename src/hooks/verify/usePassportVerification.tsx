import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "react-native-image-picker";
import { PhotoAsset } from "../../types/Media";
import { User } from "../../types/User";
import { VerificationResponse } from "../../types/Verification";

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
  updateUser: (partial: Partial<User>) => void
): UsePassportVerificationResult {
  const [photo, setPhoto] = useState<PhotoAsset | null>(null);
  const [loading, setLoading] = useState(false);

  const choosePhoto = () => {
    ImagePicker.launchImageLibrary({ mediaType: "photo" }, (response) => {
      const asset = response.assets?.[0];
      if (!asset?.uri) return;

      setPhoto({
        uri: asset.uri,
        type: asset.type,
        fileName: asset.fileName,
      });
    });
  };

  const clearPhoto = () => setPhoto(null);

  const uploadPassport = async () => {
    if (!photo || !user) {
      Alert.alert("Missing photo or user");
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", {
        uri: photo.uri,
        type: photo.type ?? "image/jpeg",
        name: photo.fileName ?? "passport.jpg",
      } as any);

      form.append("userId", user.id.toString());

      const res = await fetch(`${API}/verify-passport`, {
        method: "POST",
        body: form,
      });

      const data: VerificationResponse = await res.json();

      if (!res.ok || !data.verified) {
        Alert.alert("Verification failed");
        return;
      }

      // ✅ Update user state ONLY with verification level
      updateUser({ verification_level: data.level });

      Alert.alert("✅ Passport verified");
      clearPhoto();
    } catch (err) {
      console.error(err);
      Alert.alert("Network error");
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