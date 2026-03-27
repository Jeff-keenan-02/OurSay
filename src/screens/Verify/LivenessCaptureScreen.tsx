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
      setErrorMessage("Could not start liveness session. Please try again.");
      setState("error");
    }
  }

  async function confirmSession(completedSessionId: string) {
    try {
      setState("checking");
      await api.post("/verify/liveness/confirm", { sessionId: completedSessionId });
      updateUser({ verification_tier: 1 });
      setState("success");
    } catch (err: any) {
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
    } catch {
      setErrorMessage("Unexpected response from liveness check.");
      setState("error");
    }
  }

  const livenessUrl = useMemo(() => {
    if (!sessionId) return null;
    return `${LIVENESS_BASE_URL}?sessionId=${encodeURIComponent(sessionId)}`;
  }, [sessionId]);

  // Success
  if (state === "success") {
    return (
      <Screen scroll showBack title="Human Verification">
        <View style={[styles.resultCard, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.resultIcon, { backgroundColor: "#22c55e18" }]}>
            <MaterialCommunityIcons name="check-circle" size={56} color="#22c55e" />
          </View>
          <Text variant="headlineSmall" style={{ fontWeight: "700", color: theme.colors.onSurface, textAlign: "center" }}>
            Verified!
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center", lineHeight: 20 }}>
            Your liveness check passed. You have unlocked Tier 1 access.
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.cta, { backgroundColor: "#22c55e" }]}
          onPress={() => navigation.navigate("VerificationHome")}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Back to Verification</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
        </TouchableOpacity>
      </Screen>
    );
  }

  // Error
  if (state === "error") {
    return (
      <Screen scroll showBack title="Human Verification">
        <View style={[styles.resultCard, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.resultIcon, { backgroundColor: "#ef444418" }]}>
            <MaterialCommunityIcons name="alert-circle" size={56} color="#ef4444" />
          </View>
          <Text variant="headlineSmall" style={{ fontWeight: "700", color: theme.colors.onSurface, textAlign: "center" }}>
            Check Failed
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center", lineHeight: 20 }}>
            {errorMessage}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.cta, { backgroundColor: COLOR }]}
          onPress={() => createSession()}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="refresh" size={18} color="#fff" />
          <Text style={styles.ctaText}>Try Again</Text>
        </TouchableOpacity>
      </Screen>
    );
  }

  // Loading / checking
  if (state === "loading" || state === "checking" || !livenessUrl) {
    return (
      <Screen showBack title="Human Verification">
        <View style={[styles.resultCard, { backgroundColor: theme.colors.surface }]}>
          <ActivityIndicator color={COLOR} size="large" />
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.md, textAlign: "center" }}>
            {state === "loading" ? "Preparing liveness check…" : "Verifying result…"}
          </Text>
        </View>
      </Screen>
    );
  }

  // WebView (ready)
  return (
    <View style={[styles.fullscreen, { backgroundColor: "#0f0f0f" }]}>
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
        style={styles.webView}
      />
      <View style={styles.backRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
          <Text style={styles.floatingBackText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  backRow: {
    height: 70,
    backgroundColor: "#0f0f0f",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  webViewWrapper: {
    flex: 1,
    margin: spacing.md,
    borderRadius: 20,
    overflow: "hidden",
  },
  floatingBack: {
    position: "absolute",
    bottom: 36,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(30,30,30,0.9)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  floatingBackText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  resultCard: {
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  resultIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
    marginHorizontal: spacing.md,
  },
  ctaText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
