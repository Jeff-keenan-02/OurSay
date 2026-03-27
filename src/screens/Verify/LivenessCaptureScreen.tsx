import React, { useState, useEffect, useContext, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, ActivityIndicator, useTheme } from "react-native-paper";
import WebView from "react-native-webview";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";
import { AuthContext } from "../../context/AuthContext";
import { useApiClient } from "../../hooks/common/useApiClient";
import { VERIFICATION_TIERS } from "../../types/verification";

const COLOR = VERIFICATION_TIERS[1].color;
const LIVENESS_BASE_URL = "https://oursay-0ixb.onrender.com/liveness/";

type State = "loading" | "ready" | "checking" | "success" | "error";

export default function LivenessCaptureScreen({ navigation }: any) {
  const { updateUser } = useContext(AuthContext);
  const api = useApiClient();
  const theme = useTheme();

  const [state, setState] = useState<State>("loading");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    createSession();
  }, []);

  async function createSession() {
    try {
      setState("loading");
      setErrorMessage("");

      const response = await api.post<{ sessionId: string }>("/verify/liveness/session", {});
      setSessionId(response.sessionId);
      setState("ready");
    } catch (err) {
      console.error("Create liveness session failed:", err);
      setErrorMessage("Could not start liveness session. Please try again.");
      setState("error");
    }
  }

  async function confirmSession(completedSessionId: string) {
    try {
      setState("checking");

      await api.post("/verify/liveness/confirm", {
        sessionId: completedSessionId,
      });

      updateUser({ verification_tier: 1 });
      setState("success");
    } catch (err: any) {
      console.error("Confirm liveness failed:", err);
      setErrorMessage(err?.message || "Liveness check failed. Please try again.");
      setState("error");
    }
  }

  function handleWebViewMessage(event: any) {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "LIVENESS_COMPLETE" && data.success && data.sessionId) {
        confirmSession(data.sessionId);
        return;
      }

      if (data.type === "LIVENESS_ERROR") {
        setErrorMessage(data.message || "Something went wrong during the check.");
        setState("error");
      }
    } catch (err) {
      console.error("Failed to parse WebView message:", err);
      setErrorMessage("Unexpected response from liveness check.");
      setState("error");
    }
  }

  const livenessUrl = useMemo(() => {
    if (!sessionId) return null;
    return `${LIVENESS_BASE_URL}?sessionId=${encodeURIComponent(sessionId)}`;
  }, [sessionId]);

  const retry = () => {
    createSession();
  };

  if (state === "success") {
    return (
      <Screen scroll showBack title="Human Verification">
        <View style={styles.resultContainer}>
          <View style={[styles.resultIcon, { backgroundColor: "#22c55e18" }]}>
            <MaterialCommunityIcons name="check-circle" size={64} color="#22c55e" />
          </View>
          <Text variant="headlineSmall" style={{ fontWeight: "700", textAlign: "center" }}>
            Verified!
          </Text>
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.onSurfaceVariant,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            Your liveness check passed. You have unlocked Tier 1 access.
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

  if (state === "error") {
    return (
      <Screen scroll showBack title="Human Verification">
        <View style={styles.resultContainer}>
          <View style={[styles.resultIcon, { backgroundColor: "#ef444418" }]}>
            <MaterialCommunityIcons name="alert-circle" size={64} color="#ef4444" />
          </View>
          <Text variant="headlineSmall" style={{ fontWeight: "700", textAlign: "center" }}>
            Check Failed
          </Text>
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.onSurfaceVariant,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            {errorMessage}
          </Text>
          <TouchableOpacity
            style={[styles.cta, { backgroundColor: COLOR }]}
            onPress={retry}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Try Again</Text>
            <MaterialCommunityIcons name="refresh" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  if (state === "loading" || state === "checking" || !livenessUrl) {
    return (
      <Screen showBack title="Human Verification">
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={COLOR} size="large" />
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.onSurfaceVariant,
              marginTop: spacing.md,
            }}
          >
            {state === "loading" ? "Preparing liveness check…" : "Verifying result…"}
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <View style={styles.detectorContainer}>
      <WebView
        source={{ uri: livenessUrl }}
        onMessage={handleWebViewMessage}
        onError={() => {
          setErrorMessage("Could not load liveness check.");
          setState("error");
        }}
        javaScriptEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        allowsProtectedMedia
        mediaCapturePermissionGrantType="grant"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  detectorContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },
  resultContainer: {
    alignItems: "center",
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  resultIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  ctaText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});