import React, { useState, useContext } from "react";
import { View, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform } from "react-native";
import { Text, ActivityIndicator, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Geolocation from "@react-native-community/geolocation";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";
import { AuthContext } from "../../context/AuthContext";
import { useApiClient } from "../../hooks/common/useApiClient";
import { VERIFICATION_TIERS } from "../../types/verification";

const COLOR = VERIFICATION_TIERS[3].color;

type State = "idle" | "locating" | "checking" | "success" | "failed";

export default function ResidenceCaptureScreen({ navigation }: any) {
  const { user, updateUser } = useContext(AuthContext);
  const api = useApiClient();
  const theme = useTheme();
  const [state, setState] = useState<State>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const runCheck = async () => {
    if (!user) return;
    setErrorMessage("");
    setState("locating");

    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setErrorMessage("Location permission is required to verify residency.");
          setState("failed");
          return;
        }
      }

      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setState("checking");
          try {
            const data = await api.post<{ verified: boolean; level?: number }>(
              "/verify/residence",
              { latitude, longitude }
            );
            if (data.verified) {
              updateUser({ verification_tier: 3 });
              setState("success");
            } else {
              setErrorMessage("Your location does not appear to be within Ireland.");
              setState("failed");
            }
          } catch (err: any) {
            setErrorMessage(err?.message || "Verification failed. Please try again.");
            setState("failed");
          }
        },
        (err) => {
          setErrorMessage("Could not get your location. Please allow location access and try again.");
          setState("failed");
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setState("failed");
    }
  };

  if (state === "success") {
    return (
      <Screen scroll showBack title="Location Verification">
        <View style={styles.resultContainer}>
          <View style={[styles.resultIcon, { backgroundColor: "#22c55e18" }]}>
            <MaterialCommunityIcons name="check-circle" size={64} color="#22c55e" />
          </View>
          <Text variant="headlineSmall" style={{ fontWeight: "700", color: theme.colors.onBackground, textAlign: "center" }}>
            Location Verified!
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center", lineHeight: 20 }}>
            Your residency has been confirmed. You are now fully verified and have unlocked Tier 3 access.
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
    <Screen scroll showBack title="Network Check" subtitle="Confirming your location via network signals">
      {/* Status area */}
      <View style={[styles.statusArea, { backgroundColor: theme.colors.surface, borderColor: state === "failed" ? "#ef444440" : COLOR + "25" }]}>
        {state === "locating" ? (
          <View style={styles.checkingContent}>
            <ActivityIndicator size="large" color={COLOR} />
            <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: "600", marginTop: spacing.md }}>
              Getting your location…
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
              Please allow location access when prompted.
            </Text>
          </View>
        ) : state === "checking" ? (
          <View style={styles.checkingContent}>
            <ActivityIndicator size="large" color={COLOR} />
            <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: "600", marginTop: spacing.md }}>
              Verifying location…
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
              Confirming you are within Ireland.
            </Text>
          </View>
        ) : state === "failed" ? (
          <View style={styles.checkingContent}>
            <MaterialCommunityIcons name="map-marker-off" size={52} color="#ef4444" style={{ opacity: 0.7 }} />
            <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: "600", marginTop: spacing.md }}>
              Check did not pass
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center", lineHeight: 18 }}>
              {errorMessage || "We could not confirm your location is within Ireland."}
            </Text>
          </View>
        ) : (
          <View style={styles.checkingContent}>
            <View style={[styles.iconCircle, { backgroundColor: COLOR + "18" }]}>
              <MaterialCommunityIcons name="map-marker" size={40} color={COLOR} />
            </View>
            <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: "600", marginTop: spacing.md }}>
              Ready to check
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center", lineHeight: 18 }}>
              Tap below to confirm your location. Your device GPS will be used once and no location data is stored.
            </Text>
          </View>
        )}
      </View>

      {/* CTA */}
      {state !== "locating" && state !== "checking" && (
        <TouchableOpacity
          style={[styles.cta, { backgroundColor: state === "failed" ? "#ef4444" : COLOR }]}
          onPress={runCheck}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>{state === "failed" ? "Try Again" : "Verify My Location"}</Text>
          <MaterialCommunityIcons name="map-marker-check" size={18} color="#fff" />
        </TouchableOpacity>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusArea: { borderRadius: 20, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.md, minHeight: 220, justifyContent: "center" },
  checkingContent: { alignItems: "center", gap: spacing.sm },
  iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center" },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14 },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  resultContainer: { alignItems: "center", gap: spacing.md, paddingTop: spacing.lg },
  resultIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center" },
});
