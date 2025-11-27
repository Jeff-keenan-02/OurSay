import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Card, Text, ProgressBar, List, useTheme } from "react-native-paper";

type Props = {
  topic: {
    id: number;
    title: string;
    description: string | null;
    total_polls: number;
    completed_polls: number;
    status: number;
  };
  onPress: () => void;
};

export default function TopicCard({ topic, onPress }: Props) {
  const theme = useTheme();

  const { total_polls, completed_polls, status } = topic;

  const isCompleted = status === 2;
  const inProgress = status === 1;
  const notStarted = status === 0;

  const progress =
    total_polls === 0 ? 0 : completed_polls / total_polls;

  const statusText = isCompleted
    ? "Completed"
    : inProgress
    ? "In Progress"
    : "Not Started";

  const statusColor = isCompleted
    ? "#4caf50"
    : inProgress
    ? "#ff9800"
    : "#9e9e9e";

  const icon = isCompleted
    ? "check-circle-outline"
    : inProgress
    ? "progress-clock"
    : "checkbox-blank-circle-outline";

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Title
          title={topic.title}
          titleStyle={{
            color: theme.colors.onSurface,
            fontSize: 20,
            fontWeight: "600",
          }}
          left={(props) => (
            <List.Icon {...props} icon={icon} color={statusColor} />
          )}
        />

        <Card.Content>
          {topic.description && (
            <Text style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
              {topic.description}
            </Text>
          )}

          <ProgressBar
            progress={progress}
            color={statusColor}
            style={[styles.progress, { backgroundColor: notStarted ? "#333" : "#fff3" }]}
          />

          <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            {statusText} — {completed_polls}/{total_polls} polls
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 18,
  },
  progress: {
    height: 8,
    borderRadius: 6,
  },
});