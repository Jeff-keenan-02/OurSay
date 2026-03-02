import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useThemeMode } from "../../context/ThemeModeContext";

import {
  Text,
  Button,
  List,
  Switch,
  useTheme,
} from "react-native-paper";

import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { VERIFICATION_TIERS, VerificationTier } from "../../types/verification";



export default function SettingsScreen() {
  const theme = useTheme();
  const { logout, user } = useContext(AuthContext);
  const { mode, setMode } = useThemeMode();

  const isDark = mode === "dark";
  const themeLabel =
    mode === "system" ? "System" : isDark ? "Dark" : "Light";

  // ✅ SINGLE source of truth
  const level: VerificationTier = user?.verification_tier ?? 0;
  const tier = VERIFICATION_TIERS[level];

  return (
    <Screen>
      {/* --- USER --- */}
      <Section label="Your Account">
        <List.Item
          title={`Logged in as ${user?.username}`}
          left={(props) => (
            <List.Icon {...props} icon="account" />
          )}
        />
      </Section>

      {/* --- VERIFICATION --- */}
      <Section label="Verification">
        <List.Item
          title={tier.label}
          description={tier.description}
          left={(props) => (
            <List.Icon
              {...props}
              icon={tier.icon}
              color={tier.color}
            />
          )}
        />

        {tier.next && (
          <Text
            style={{
              marginTop: 6,
              marginLeft: 56,
              color: theme.colors.onSurfaceVariant,
              fontSize: 13,
            }}
          >
            Next step: {tier.next}
          </Text>
        )}
      </Section>

      {/* --- APPEARANCE --- */}
      <Section label="Appearance">
        <List.Item
          title="Theme"
          description={themeLabel}
          left={(props) => (
            <List.Icon {...props} icon="palette" />
          )}
        />
        <Switch
          value={isDark}
          onValueChange={(value) =>
            setMode(value ? "dark" : "light")
          }
        />
      </Section>

      {/* --- SIGN OUT --- */}
      <Section>
        <Button
          mode="contained"
          onPress={logout}
          buttonColor={theme.colors.error}
        >
          Sign Out
        </Button>
      </Section>
    </Screen>
  );
}