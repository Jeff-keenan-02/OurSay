import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme, Card, Avatar } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";
import { useApiClient } from "../../hooks/common/useApiClient";

export default function PollAnalyticsListScreen({ navigation }: any) {
  const theme = useTheme();
  const api = useApiClient();

  type Poll = {
    id: number;
    question: string;
    topic: string;
  };

  const [polls, setPolls] = useState<Poll[]>([]);

  useEffect(() => {
    api.get("/analytics/polls").then((res: any) => {
      setPolls(res);
    });
  }, []);

  return (
    <Screen
      scroll
      title="Poll Analytics"
      subtitle="Select a poll to view aggregated results."
    >
      <View style={styles.container}>
        {polls.map((poll) => (
          <TouchableOpacity
            key={poll.id}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("PollAnalyticsDetail", { pollId: poll.id })
            }
          >
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                
                {/* Left icon */}
                <Avatar.Icon
                  icon="chart-bar"
                  size={40}
                  style={styles.icon}
                />

                {/* Text */}
                <View style={styles.textContainer}>
                  <Text style={styles.question}>
                    {poll.question}
                  </Text>

                  <View style={styles.metaRow}>
                    <Text style={styles.topic}>
                      {poll.topic}
                    </Text>
                  </View>
                </View>

                {/* Right arrow */}
                <Text style={styles.arrow}>›</Text>

              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  card: {
    borderRadius: 20,
  },

  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  icon: {
    backgroundColor: "#3B82F620",
  },

  textContainer: {
    flex: 1,
    gap: 4,
  },

  question: {
    fontWeight: "600",
    fontSize: 15,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  topic: {
    fontSize: 12,
    opacity: 0.6,
  },

  arrow: {
    fontSize: 22,
    opacity: 0.3,
  },
});