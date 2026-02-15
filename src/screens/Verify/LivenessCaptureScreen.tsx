// screens/Verify/LivenessCaptureScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Button, Text, ActivityIndicator } from "react-native-paper";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { API_BASE_URL } from "../../config/api";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { BackRow } from "../../components/common/BackRow";

const CHALLENGES = [
  "Blink twice",
  "Turn your head left",
  "Turn your head right",
  "Open your mouth",
];

export default function LivenessCaptureScreen() {
  const cameraRef = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices.find((d) => d.position === "front");
  const { user, updateUser } = useContext(AuthContext);
  
  const [challenge, setChallenge] = useState("");
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const random = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
    setChallenge(random);

    Camera.requestCameraPermission();
    Camera.requestMicrophonePermission();
  }, []);

  if (!device) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  const startRecording = async () => {
    if (!cameraRef.current) return;

    setRecording(true);

    cameraRef.current.startRecording({
      fileType: "mp4",
      onRecordingFinished: async (video) => {
        setRecording(false);
        await uploadLiveness(video.path);
      },
      onRecordingError: (error) => {
        console.error(error);
        setRecording(false);
      },
    });

    // Auto-stop after 4 seconds
    setTimeout(() => {
      cameraRef.current?.stopRecording();
    }, 4000);
  };

  const uploadLiveness = async (videoPath: string) => {
      if (!user) {
    Alert.alert("You must be logged in");
    return;
  }

    setUploading(true);

    const form = new FormData();
    form.append("video", {
      uri: `file://${videoPath}`,
      type: "video/mp4",
      name: "liveness.mp4",
    } as any);

  form.append("challenge", challenge);
  form.append("userId", String(user.id));

   const res = await fetch(`${API_BASE_URL}/verify/verify-liveness`, {
      method: "POST",
      body: form,
    });

  const data = await res.json();

  if (data.verified) {
    // 🔑 THIS is the missing piece
    updateUser({ verification_tier: data.level });
    Alert.alert("✅ Liveness verified");
  } else {
    Alert.alert("Liveness failed");
  }

  setUploading(false);

  };

  return (
    <Screen showBack title="Liveness Check">
      <Section>
        <Text variant="titleMedium">Please perform:</Text>
        <Text variant="headlineSmall" style={styles.challenge}>
          {challenge}
        </Text>

        <View style={styles.cameraBox}>
          <Camera
            ref={cameraRef}
            device={device}
            isActive={true}
            video
            audio
            style={StyleSheet.absoluteFill}
          />
        </View>

        {recording && <ActivityIndicator style={{ marginVertical: 12 }} />}

        <Button
          mode="contained"
          onPress={startRecording}
          disabled={recording || uploading}
        >
          Start Liveness Check
        </Button>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  challenge: {
    marginVertical: 12,
    fontWeight: "700",
  },
  cameraBox: {
    height: 320,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
    marginBottom: 20,
  },
});