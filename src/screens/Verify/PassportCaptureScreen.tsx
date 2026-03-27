import React, { useContext, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Text, ActivityIndicator, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from "../../context/AuthContext";
import { usePassportVerification } from "../../hooks/verify/usePassportVerification";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";
import { VERIFICATION_TIERS } from "../../types/verification";

const COLOR = VERIFICATION_TIERS[2].color;

export default function PassportCaptureScreen({ navigation }: any) {
  const theme = useTheme();
  const { updateUser } = useContext(AuthContext);
  const { photo, loading, error, capturePassport, uploadPassport } = usePassportVerification();
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleUpload = async () => {
    setErrorMessage("");
    const data = await uploadPassport();
    if (data?.success) {
      updateUser({ verification_tier: data.level });
      setSuccess(true);
    } else {
      setErrorMessage(error || "Passport verification failed. Please try again.");
    }
  };

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
      {/* Capture area */}
      <TouchableOpacity
        style={[
          styles.cameraArea,
          { borderColor: photo ? COLOR + "80" : theme.colors.outline + "40", backgroundColor: theme.colors.surface },
        ]}
        onPress={capturePassport}
        activeOpacity={0.8}
      >
        {photo ? (
          <Image source={{ uri: photo.uri }} style={styles.preview} />
        ) : (
          <View style={styles.cameraPlaceholder}>
            <MaterialCommunityIcons name="passport" size={52} color={theme.colors.onSurfaceVariant} style={{ opacity: 0.4 }} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, opacity: 0.5, marginTop: spacing.sm, textAlign: "center" }}>
              Tap to capture your passport
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Hint */}
      {!photo && (
        <View style={[styles.hintRow, { backgroundColor: COLOR + "12", borderColor: COLOR + "30" }]}>
          <MaterialCommunityIcons name="information-outline" size={15} color={COLOR} />
          <Text variant="labelSmall" style={{ flex: 1, color: COLOR, lineHeight: 17 }}>
            Make sure the two lines of text at the bottom of the page (MRZ) are fully visible and sharp.
          </Text>
        </View>
      )}

      {/* Error */}
      {!!errorMessage && (
        <View style={[styles.errorBanner, { backgroundColor: "#ef444418", borderColor: "#ef444440" }]}>
          <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#ef4444" />
          <Text variant="bodySmall" style={{ flex: 1, color: "#ef4444", lineHeight: 17 }}>{errorMessage}</Text>
        </View>
      )}

      {/* Actions */}
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={COLOR} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Verifying…</Text>
        </View>
      ) : (
        <View style={styles.buttonStack}>
          {photo && (
            <TouchableOpacity style={[styles.cta, { backgroundColor: COLOR }]} onPress={handleUpload} activeOpacity={0.85}>
              <Text style={styles.ctaText}>Verify Passport</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.ctaOutline, { borderColor: COLOR + "60" }]} onPress={capturePassport} activeOpacity={0.8}>
            <MaterialCommunityIcons name="camera-retake" size={18} color={COLOR} />
            <Text style={[styles.ctaOutlineText, { color: COLOR }]}>{photo ? "Retake Photo" : "Open Camera"}</Text>
          </TouchableOpacity>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cameraArea: { borderRadius: 20, borderWidth: 2, borderStyle: "dashed", height: 220, overflow: "hidden", marginBottom: spacing.md, justifyContent: "center", alignItems: "center" },
  cameraPlaceholder: { alignItems: "center", paddingHorizontal: spacing.lg },
  preview: { width: "100%", height: "100%", resizeMode: "cover" },
  hintRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, padding: spacing.sm, borderRadius: 10, borderWidth: 1, marginBottom: spacing.md },
  errorBanner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm, borderRadius: 10, borderWidth: 1, marginBottom: spacing.md },
  loadingRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingVertical: spacing.md },
  buttonStack: { gap: spacing.sm },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14 },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  ctaOutline: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 14, borderWidth: 1.5 },
  ctaOutlineText: { fontWeight: "600", fontSize: 15 },
  resultContainer: { alignItems: "center", gap: spacing.md, paddingTop: spacing.lg },
  resultIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center" },
});
