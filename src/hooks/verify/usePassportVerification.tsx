import { useState, useCallback } from "react";

import { useApiClient } from "../common/useApiClient";

import { PhotoAsset } from "../../types/Photo";
import { User } from "../../types/User";
import { VerificationResponse } from "../../types/verification";


type UsePassportVerificationResult = {
  photo: PhotoAsset | null;
  loading: boolean;
  error: string | null;
  captureFromCamera: (path: string) => void;
  uploadPassport: () => Promise<VerificationResponse | null>;
  clearPhoto: () => void;
};

export function usePassportVerification(): UsePassportVerificationResult {

  const api = useApiClient();

  const [photo, setPhoto] = useState<PhotoAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -------------------------------------------------
     Capture Passport
  --------------------------------------------------*/

  const captureFromCamera = useCallback((path: string) => {
    setPhoto({
      uri: path,
      type: "image/jpeg",
      fileName: "passport.jpg",
    });
    setError(null);
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

    if (!photo) {
      setError("Missing passport photo or user");
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const form = new FormData();
      const uri = photo.uri.startsWith("file://") ? photo.uri : `file://${photo.uri}`;
      form.append("file", {
        uri,
        type: photo.type,
        name: photo.fileName,
      } as any);

      const data = await api.post<VerificationResponse>(
        "/verify/passport",
        form
      );
      

      return data;

    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "Verification failed");
      return null;

    } finally {
      setLoading(false);
    }

  }, [photo, api]);

  return {
    photo,
    loading,
    error,
    captureFromCamera,
    uploadPassport,
    clearPhoto,
  };
}