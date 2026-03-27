import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";
import { VERIFICATION_TIERS } from "../../types/verification";

const COLOR = VERIFICATION_TIERS[2].color;

const STEPS = [
  { icon: "passport",      text: "Open your passport to the photo information page" },
  { icon: "text-box-outline", text: "Ensure the MRZ lines at the bottom are clearly visible" },
  { icon: "camera-outline", text: "Capture a flat, well-lit photo — no glare or shadows" },
];

const PRIVACY = [
  { icon: "image-off-outline",   text: "Passport images are never stored on our servers" },
  { icon: "face-recognition",    text: "No face comparison or biometric analysis is performed" },
  { icon: "lock-outline",        text: "Only an irreversible hash of the MRZ is retained" },
];

export default function PassportIntroScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();

  return (
    <Screen scroll showBack title="Citizen Verification" subtitle="Step 2 of 3 · Confirms your citizenship">
      <View style={[styles.hero, { backgroundColor: COLOR + "15" }]}>
        <MaterialCommunityIcons name="passport" size={52} color={COLOR} />
        <Text variant="titleMedium" style={[styles.heroTitle, { color: theme.colors.onSurface }]}>
          Passport Check
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center", lineHeight: 18 }}>
          We verify your citizenship by reading your passport's machine-readable zone — without ever seeing your face.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>HOW IT WORKS</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          {STEPS.map((s, i) => (
            <View key={i} style={styles.row}>
              <View style={[styles.stepBubble, { backgroundColor: COLOR + "18" }]}>
                <Text style={{ color: COLOR, fontWeight: "700", fontSize: 13 }}>{i + 1}</Text>
              </View>
              <Text variant="bodySmall" style={{ flex: 1, color: theme.colors.onSurface, lineHeight: 18 }}>
                {s.text}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>YOUR PRIVACY</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          {PRIVACY.map((n, i) => (
            <View key={i} style={styles.row}>
              <MaterialCommunityIcons name={n.icon} size={18} color={COLOR} />
              <Text variant="bodySmall" style={{ flex: 1, color: theme.colors.onSurfaceVariant, lineHeight: 18 }}>
                {n.text}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity style={[styles.cta, { backgroundColor: COLOR }]} onPress={() => navigation.navigate("PassportCapture")} activeOpacity={0.85}>
        <Text style={styles.ctaText}>Capture Passport</Text>
        <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 20, padding: spacing.lg, alignItems: "center", gap: spacing.sm, marginBottom: spacing.md },
  heroTitle: { fontWeight: "700", marginTop: spacing.xs },
  section: { gap: spacing.sm, marginBottom: spacing.md },
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.7 },
  card: { borderRadius: 16, padding: spacing.md, gap: spacing.md },
  row: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  stepBubble: { width: 26, height: 26, borderRadius: 13, justifyContent: "center", alignItems: "center", flexShrink: 0, marginTop: 1 },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, marginTop: spacing.sm },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
