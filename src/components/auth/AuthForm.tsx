import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, TextInput, Button, Card, Avatar, useTheme } from "react-native-paper";

interface Props {
  title: string;
  icon: string;
  username: string;
  password: string;
  error?: string | null;
  loading?: boolean;
  submitLabel: string;
  onSubmit: () => void;
  onChangeUsername: (v: string) => void;
  onChangePassword: (v: string) => void;
  footerLabel: string;
  onFooterPress: () => void;
}

export default function AuthForm({
  title,
  icon,
  username,
  password,
  error,
  loading,
  submitLabel,
  footerLabel,
  onSubmit,
  onChangeUsername,
  onChangePassword,
  onFooterPress,
}: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
      <Avatar.Icon
        size={84}
        icon={icon}
        color={theme.colors.primary}
        style={styles.icon}
      />

      <Text variant="headlineLarge" style={[styles.header, { color: theme.colors.onBackground }]}>
        OurSay
      </Text>

      <Card mode="elevated" style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Title
          title={title}
          titleStyle={{ textAlign: "center", color: theme.colors.onSurface }}
        />

        <Card.Content>

          {error ? (
            <Text style={{ color: theme.colors.error, marginBottom: 8 }}>
              {error}
            </Text>
          ) : null}

          <TextInput
            mode="outlined"
            label="Username"
            value={username}
            onChangeText={onChangeUsername}
            autoCapitalize="none"
            style={{ marginBottom: 10 }}
          />

          <TextInput
            mode="outlined"
            label="Password"
            secureTextEntry
            value={password}
            onChangeText={onChangePassword}
            style={{ marginBottom: 15 }}
          />

          <Button mode="contained" onPress={onSubmit} loading={loading}>
            {submitLabel}
          </Button>

          <Button mode="text" onPress={onFooterPress} style={{ marginTop: 8 }}>
            {footerLabel}
          </Button>

        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  icon: {
    backgroundColor: "transparent",
    marginBottom: 10,
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  card: {
    width: "90%",
    maxWidth: 400,
    padding: 10,
  },
});