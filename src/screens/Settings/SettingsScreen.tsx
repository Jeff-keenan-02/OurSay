import React, { useContext, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import {
  Text,
  useTheme,
  Divider,
  ActivityIndicator,
  Modal,
  Portal,
  TextInput,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from "../../context/AuthContext";
import { useThemeMode } from "../../context/ThemeModeContext";
import { VERIFICATION_TIERS, VerificationTier } from "../../types/verification";
import { useChangePassword } from "../../hooks/auth/useChangePassword";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeader({ title }: { title: string }) {
  const theme = useTheme();
  return (
    <Text style={[styles.sectionHeader, { color: theme.colors.primary }]}>
      {title.toUpperCase()}
    </Text>
  );
}

function SettingsRow({
  icon,
  iconColor,
  label,
  value,
  onPress,
  destructive,
  rightElement,
}: {
  icon: string;
  iconColor?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  rightElement?: React.ReactNode;
}) {
  const theme = useTheme();
  const color = destructive ? theme.colors.error : theme.colors.onSurface;
  const ic = iconColor ?? (destructive ? theme.colors.error : theme.colors.primary);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={onPress ? 0.6 : 1}
      style={styles.row}
    >
      <View style={[styles.iconWrap, { backgroundColor: ic + "18" }]}>
        <MaterialCommunityIcons name={icon} size={20} color={ic} />
      </View>

      <Text style={[styles.rowLabel, { color }]}>{label}</Text>

      <View style={styles.rowRight}>
        {value ? (
          <Text style={[styles.rowValue, { color: theme.colors.onSurfaceVariant }]}>
            {value}
          </Text>
        ) : null}
        {rightElement ?? null}
        {onPress && !rightElement ? (
          <MaterialCommunityIcons
            name="chevron-right"
            size={16}
            color={theme.colors.onSurfaceVariant}
          />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function SettingsGroup({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.group, { backgroundColor: theme.colors.surface }]}>
      {React.Children.map(children, (child, i) => {
        const arr = React.Children.toArray(children);
        return (
          <>
            {child}
            {i < arr.length - 1 && (
              <Divider style={{ marginLeft: 56 }} />
            )}
          </>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Change Password Modal
// ---------------------------------------------------------------------------

function ChangePasswordModal({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) {
  const theme = useTheme();
  const { changePassword, loading, error } = useChangePassword();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  const handleSubmit = async () => {
    if (next !== confirm) {
      Alert.alert("Passwords don't match", "New password and confirmation must match.");
      return;
    }
    if (next.length < 8) {
      Alert.alert("Too short", "New password must be at least 8 characters.");
      return;
    }

    const ok = await changePassword(current, next);
    if (ok) {
      Alert.alert("Success", "Your password has been updated.");
      reset();
      onDismiss();
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={() => { reset(); onDismiss(); }}
        contentContainerStyle={[
          styles.modal,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
          Change Password
        </Text>

        <TextInput
          label="Current password"
          value={current}
          onChangeText={setCurrent}
          secureTextEntry={!showCurrent}
          right={
            <TextInput.Icon
              icon={showCurrent ? "eye-off" : "eye"}
              onPress={() => setShowCurrent((v) => !v)}
            />
          }
          style={styles.input}
          mode="outlined"
          autoCapitalize="none"
        />

        <TextInput
          label="New password"
          value={next}
          onChangeText={setNext}
          secureTextEntry={!showNext}
          right={
            <TextInput.Icon
              icon={showNext ? "eye-off" : "eye"}
              onPress={() => setShowNext((v) => !v)}
            />
          }
          style={styles.input}
          mode="outlined"
          autoCapitalize="none"
        />

        <TextInput
          label="Confirm new password"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry={!showNext}
          style={styles.input}
          mode="outlined"
          autoCapitalize="none"
        />

        {error ? (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        ) : null}

        <View style={styles.modalButtons}>
          <TouchableOpacity
            onPress={() => { reset(); onDismiss(); }}
            style={[styles.modalBtn, { borderColor: theme.colors.outline }]}
          >
            <Text style={{ color: theme.colors.onSurface }}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !current || !next || !confirm}
            style={[
              styles.modalBtn,
              styles.modalBtnPrimary,
              {
                backgroundColor: theme.colors.primary,
                opacity: loading || !current || !next || !confirm ? 0.5 : 1,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator size={16} color={theme.colors.onPrimary} />
            ) : (
              <Text style={{ color: theme.colors.onPrimary, fontWeight: "600" }}>
                Update
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </Portal>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

const THEME_OPTIONS: { label: string; value: "light" | "dark" | "system" }[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

export default function SettingsScreen({ navigation }: any) {
  const theme = useTheme();
  const { logout, user } = useContext(AuthContext);
  const { mode, setMode } = useThemeMode();

  const [pwModalVisible, setPwModalVisible] = useState(false);

  const level: VerificationTier = user?.verification_tier ?? 0;
  const tier = VERIFICATION_TIERS[level];

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <>
      <ChangePasswordModal
        visible={pwModalVisible}
        onDismiss={() => setPwModalVisible(false)}
      />

      <ScrollView
        style={[styles.screen, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Page title */}
        <Text style={[styles.pageTitle, { color: theme.colors.primary }]}>
          Settings
        </Text>

        {/* ── ACCOUNT ──────────────────────────────── */}
        <SectionHeader title="Account" />
        <SettingsGroup>
          <SettingsRow
            icon="account-outline"
            label="Username"
            value={user?.username}
          />
          <SettingsRow
            icon="lock-outline"
            label="Change Password"
            onPress={() => setPwModalVisible(true)}
          />
        </SettingsGroup>

        {/* ── VERIFICATION ─────────────────────────── */}
        <SectionHeader title="Verification" />
        <SettingsGroup>
          <SettingsRow
            icon="shield-check-outline"
            iconColor={tier.color}
            label="Status"
            value={tier.label}
            onPress={() => navigation.navigate("Verify")}
          />
          {tier.next && (
            <SettingsRow
              icon="arrow-up-circle-outline"
              label="Next step"
              value={tier.next}
              onPress={() => navigation.navigate("Verify")}
            />
          )}
        </SettingsGroup>

        {/* ── APPEARANCE ───────────────────────────── */}
        <SectionHeader title="Appearance" />
        <View style={[styles.group, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.secondary + "18" }]}>
              <MaterialCommunityIcons name="palette-outline" size={20} color={theme.colors.secondary} />
            </View>
            <Text style={[styles.rowLabel, { color: theme.colors.onSurface }]}>Theme</Text>
            <View style={styles.segmentedControl}>
              {THEME_OPTIONS.map((opt) => {
                const active = mode === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setMode(opt.value)}
                    style={[
                      styles.segment,
                      active && { backgroundColor: theme.colors.primary },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: active ? "700" : "400",
                        color: active
                          ? theme.colors.onPrimary
                          : theme.colors.onSurfaceVariant,
                      }}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── ABOUT ────────────────────────────────── */}
        <SectionHeader title="About" />
        <SettingsGroup>
          <SettingsRow
            icon="file-document-outline"
            label="Terms of Service"
            onPress={() => Linking.openURL("https://oursay.ie/terms")}
          />
          <SettingsRow
            icon="shield-lock-outline"
            label="Privacy Policy"
            onPress={() => Linking.openURL("https://oursay.ie/privacy")}
          />
          <SettingsRow
            icon="information-outline"
            label="Version"
            value="1.0.0"
          />
        </SettingsGroup>

        {/* ── SIGN OUT ─────────────────────────────── */}
        <SectionHeader title="Account Actions" />
        <SettingsGroup>
          <SettingsRow
            icon="logout"
            label="Sign Out"
            onPress={handleSignOut}
            destructive
          />
        </SettingsGroup>
      </ScrollView>
    </>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 6,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 6,
    marginLeft: 4,
  },
  group: {
    borderRadius: 14,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    minHeight: 52,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowValue: {
    fontSize: 14,
  },
  segmentedControl: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(128,128,128,0.25)",
  },
  segment: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  // Modal
  modal: {
    margin: 24,
    borderRadius: 16,
    padding: 24,
    gap: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  modalBtnPrimary: {
    borderWidth: 0,
  },
});
