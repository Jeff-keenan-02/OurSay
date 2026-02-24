// hooks/verify/usePassportVerification.ts

import { useState, useCallback } from "react";
import * as ImagePicker from "react-native-image-picker";
import { API_BASE_URL } from "../../config/api";
import { PhotoAsset } from "../../types/Photo";
import { User } from "../../types/User";
import { VerificationResponse } from "../../types/VerificationType";


/* =====================================================
   usePassportVerification
   Handles:
   - Camera capture
   - Multipart upload
   - Verification request
===================================================== */

type UsePassportVerificationResult = {
  photo: PhotoAsset | null;
  loading: boolean;
  error: string | null;
  capturePassport: () => void;
  uploadPassport: () => Promise<VerificationResponse | null>;
  clearPhoto: () => void;
};

export function usePassportVerification(
  user: User | null
): UsePassportVerificationResult {

  const [photo, setPhoto] = useState<PhotoAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  /* -------------------------------------------------
     Capture Passport (Camera Only)
  --------------------------------------------------*/

  const capturePassport = useCallback(() => {
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
          setError(response.errorMessage ?? "Camera error");
          return;
        }

        const asset = response.assets?.[0];
        if (!asset?.uri) {
          setError("No image was captured");
          return;
        }

        setPhoto({
          uri: asset.uri,
          type: asset.type ?? "image/jpeg",
          fileName: asset.fileName ?? "passport.jpg",
        });
      }
    );
  }, []);

  /* -------------------------------------------------
     Clear Photo
  --------------------------------------------------*/

  const clearPhoto = useCallback(() => {
    setPhoto(null);
    setError(null);
  }, []);

  /* -------------------------------------------------
     Upload Passport
  --------------------------------------------------*/

  const uploadPassport = useCallback(async () => {

    if (!photo || !user?.id) {
      setError("Missing passport photo or user");
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const form = new FormData();

      form.append("file", {
        uri: photo.uri,
        type: photo.type,
        name: photo.fileName,
      } as any);

      form.append("userId", user.id.toString());

      const res = await fetch(
        `${API_BASE_URL}/verify/passport`,
        {
          method: "POST",
          body: form,
        }
      );

      const data: VerificationResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error("Passport verification failed");
      }

      return data;

    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "Verification failed");
      return null;

    } finally {
      setLoading(false);
    }

  }, [photo, user?.id]);

  /* -------------------------------------------------
     Return
  --------------------------------------------------*/

  return {
    photo,
    loading,
    error,
    capturePassport,
    uploadPassport,
    clearPhoto,
  };
}