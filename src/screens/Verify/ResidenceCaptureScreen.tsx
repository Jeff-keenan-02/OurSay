// screens/Verify/ResidenceCaptureScreen.tsx
import React, { useState, useContext } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text, ActivityIndicator, Card } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { AuthContext } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config/api";
import { BackRow } from "../../components/common/BackRow";

export default function ResidenceCaptureScreen() {
  const { user, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    verified: boolean;
    score: number;
    ip_seen: string;
  }>(null);

  const runResidenceCheck = async () => {
    if (!user) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/verify/verify-residence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();

      setResult(data);

      if (data.verified) {
        updateUser({ verification_tier: 3 });
      }

    } catch (err) {
      console.error("Residence check failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (

    <Screen
    showBack
      title="Residence Verification"
      subtitle="Contextual verification using network signals"
    >
      <Section>
        <Card style={styles.card}>
          <Card.Content>

            <Text variant="bodyMedium" style={styles.text}>
              We verify your residence using contextual signals such as network
              location and prior verification levels.
            </Text>

            <Text
              variant="bodySmall"
              style={{ opacity: 0.7, marginBottom: 16 }}
            >
              No documents are uploaded. No location is stored.
            </Text>

            {!loading && (
              <Button
                mode="contained"
                onPress={runResidenceCheck}
              >
                Verify Residence
              </Button>
            )}

            {loading && (
              <ActivityIndicator style={{ marginTop: 16 }} />
            )}

            {result && (
              <View style={{ marginTop: 20 }}>
                <Text>
                  IP Seen: {result.ip_seen}
                </Text>
                <Text>
                  Confidence Score: {result.score}%
                </Text>
                <Text>
                  Status: {result.verified ? "Verified" : "Not Verified"}
                </Text>
              </View>
            )}

          </Card.Content>
        </Card>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingVertical: 8,
  },
  text: {
    marginBottom: 12,
  },
});