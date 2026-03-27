import React, { useState, useContext } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, ActivityIndicator, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";
import { AuthContext } from "../../context/AuthContext";
import { useApiClient } from "../../hooks/common/useApiClient";
import { VERIFICATION_TIERS } from "../../types/verification";

const COLOR = VERIFICATION_TIERS[3].color;

type State = "idle" | "checking" | "success" | "failed";

export default function ResidenceCaptureScreen({ navigation }: any) {
  const { user, updateUser } = useContext(AuthContext);
  const api = useApiClient();
  const theme = useTheme();
  const [state, setState] = useState<State>("idle");

  const runCheck = async () => {
    if (!user) return;
    setState("checking");
    try {
      const data = await api.post<{ verified: boolean; level?: number }>("/verify/residence");
      if (data.verified) {
        updateUser({ verification_tier: 3 });
        setState("success");
      } else {
        setState("failed");
      }
    } catch {
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
        {state === "checking" ? (
          <View style={styles.checkingContent}>
            <ActivityIndicator size="large" color={COLOR} />
            <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: "600", marginTop: spacing.md }}>
              Running check…
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
              Analysing network signals. This only takes a moment.
            </Text>
          </View>
        ) : state === "failed" ? (
          <View style={styles.checkingContent}>
            <MaterialCommunityIcons name="map-marker-off" size={52} color="#ef4444" style={{ opacity: 0.7 }} />
            <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: "600", marginTop: spacing.md }}>
              Check did not pass
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center", lineHeight: 18 }}>
              We could not confirm your location. Make sure you are connected to your usual local network and try again.
            </Text>
          </View>
        ) : (
          <View style={styles.checkingContent}>
            <View style={[styles.iconCircle, { backgroundColor: COLOR + "18" }]}>
              <MaterialCommunityIcons name="wifi" size={40} color={COLOR} />
            </View>
            <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: "600", marginTop: spacing.md }}>
              Ready to check
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center", lineHeight: 18 }}>
              Tap the button below to run the network check. Make sure you are on your usual home or local Wi-Fi.
            </Text>
          </View>
        )}
      </View>

      {/* CTA */}
      {state !== "checking" && (
        <TouchableOpacity
          style={[styles.cta, { backgroundColor: state === "failed" ? "#ef4444" : COLOR }]}
          onPress={runCheck}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>{state === "failed" ? "Try Again" : "Run Network Check"}</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
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
