import React, { useContext, useState, useEffect, useRef, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";
import { Text, ActivityIndicator, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import { AuthContext } from "../../context/AuthContext";
import { usePassportVerification } from "../../hooks/verify/usePassportVerification";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";
import { VERIFICATION_TIERS } from "../../types/verification";

const COLOR = VERIFICATION_TIERS[2].color;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PREVIEW_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const PREVIEW_HEIGHT = PREVIEW_WIDTH * 0.65; // passport aspect ratio

export default function PassportCaptureScreen({ navigation }: any) {
  const theme = useTheme();
  const { updateUser } = useContext(AuthContext);
  const { photo, loading, error, captureFromCamera, uploadPassport, clearPhoto } = usePassportVerification();
  const [success, setSuccess] = useState(false);
  const [captureError, setCaptureError] = useState("");

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, []);

  const handleCapture = useCallback(async () => {
    setCaptureError("");
    if (!cameraRef.current) return;
    try {
      const file = await cameraRef.current.takePhoto({ flash: "off" });
      captureFromCamera(file.path);
    } catch (err) {
      setCaptureError("Failed to capture photo. Please try again.");
    }
  }, [captureFromCamera]);

  const handleUpload = async () => {
    const data = await uploadPassport();
    if (data?.success) {
      updateUser({ verification_tier: data.level });
      setSuccess(true);
    }
  };

  const errorMessage = captureError || error || "";

  if (success) {
    return (
      <Screen scroll showBack title="Citizen Verification">
        <View style={styles.resultContainer}>
          <View style={[styles.resultIcon, { backgroundColor: "#22c55e18" }]}>
            <MaterialCommunityIcons name="check-circle" size={64} color="#22c55e" />
          </View>
          <Text variant="headlineSmall" style={{ fontWeight: "700", color: theme.colors.onBackground, textAlign: "center" }}>
            Citizenship Verified!
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center", lineHeight: 20 }}>
            Your passport was successfully verified. You have unlocked Tier 2 access.
          </Text>
          <TouchableOpacity
            style={[styles.cta, { backgroundColor: "#22c55e" }]}
            onPress={() => navigation.navigate("VerificationHome")}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Back to Verification</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll showBack title="Capture Passport" subtitle="Open to the photo information page">

      {/* Camera / Preview box */}
      <View style={[styles.cameraBox, { borderColor: photo ? COLOR + "80" : theme.colors.outline + "40" }]}>
        {photo ? (
          <Image source={{ uri: `file://${photo.uri}` }} style={styles.preview} />
        ) : !hasPermission ? (
          <View style={styles.placeholder}>
            <MaterialCommunityIcons name="camera-off" size={40} color={theme.colors.onSurfaceVariant} style={{ opacity: 0.4 }} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, opacity: 0.5, marginTop: spacing.sm, textAlign: "center" }}>
              Camera permission required
            </Text>
          </View>
        ) : device ? (
          <View style={StyleSheet.absoluteFill}>
            <Camera
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={!photo}
              photo
            />
            {/* Passport outline overlay */}
            <View style={styles.overlayOuter} pointerEvents="none">
              <View style={[styles.overlayRect, { borderColor: COLOR }]}>
                {/* Corner marks */}
                <View style={[styles.corner, styles.topLeft, { borderColor: COLOR }]} />
                <View style={[styles.corner, styles.topRight, { borderColor: COLOR }]} />
                <View style={[styles.corner, styles.bottomLeft, { borderColor: COLOR }]} />
                <View style={[styles.corner, styles.bottomRight, { borderColor: COLOR }]} />
              </View>
              <Text style={[styles.overlayHint, { color: COLOR }]}>
                Align passport MRZ lines within the box
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <ActivityIndicator color={COLOR} />
          </View>
        )}
      </View>

      {/* Error banner */}
      {!!errorMessage && (
        <View style={[styles.errorBanner, { backgroundColor: "#ef444418", borderColor: "#ef444440" }]}>
          <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#ef4444" />
          <Text variant="bodySmall" style={{ flex: 1, color: "#ef4444", lineHeight: 17 }}>{errorMessage}</Text>
        </View>
      )}

      {/* Buttons */}
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={COLOR} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Verifying…</Text>
        </View>
      ) : (
        <View style={styles.buttonStack}>
          {photo ? (
            <>
              <TouchableOpacity style={[styles.cta, { backgroundColor: COLOR }]} onPress={handleUpload} activeOpacity={0.85}>
                <Text style={styles.ctaText}>Verify Passport</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.ctaOutline, { borderColor: COLOR + "60" }]} onPress={clearPhoto} activeOpacity={0.8}>
                <MaterialCommunityIcons name="camera-retake" size={18} color={COLOR} />
                <Text style={[styles.ctaOutlineText, { color: COLOR }]}>Retake Photo</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={[styles.cta, { backgroundColor: COLOR }]} onPress={handleCapture} activeOpacity={0.85}>
              <MaterialCommunityIcons name="camera" size={20} color="#fff" />
              <Text style={styles.ctaText}>Capture Passport</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cameraBox: {
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    overflow: "hidden",
    marginBottom: spacing.md,
    alignSelf: "center",
    backgroundColor: "#000",
  },
  preview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayOuter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayRect: {
    width: "88%",
    height: "75%",
    borderWidth: 1.5,
    borderRadius: 8,
    borderStyle: "dashed",
  },
  corner: {
    position: "absolute",
    width: 18,
    height: 18,
    borderColor: "#fff",
  },
  topLeft: { top: -1, left: -1, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 },
  topRight: { top: -1, right: -1, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 },
  bottomLeft: { bottom: -1, left: -1, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 },
  bottomRight: { bottom: -1, right: -1, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 },
  overlayHint: {
    marginTop: spacing.sm,
    fontSize: 11,
    fontWeight: "600",
    opacity: 0.9,
    textAlign: "center",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  buttonStack: { gap: spacing.sm },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  ctaOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  ctaOutlineText: { fontWeight: "600", fontSize: 15 },
  resultContainer: { alignItems: "center", gap: spacing.md, paddingTop: spacing.lg },
  resultIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center" },
});
