import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Card, Text, ProgressBar, List, useTheme } from "react-native-paper";
import { PollGroup } from "../../types/PollGroup";

type Props = {
  group: PollGroup;
  onPress: () => void;
};

export default function PollGroupCard({ group, onPress }: Props) {
  const theme = useTheme();

  const { title,  status, progress, completed_polls, total_polls } = group;

  const isCompleted = status === 2;
  const inProgress = status === 1;

  const statusText =
    status === 2
      ? "Completed"
      : status === 1
      ? "In Progress"
      : "Not Started";

  const statusColor =
    status === 2
      ? "#4caf50"
      : status === 1
      ? "#ff9800"
      : "#9e9e9e";

  const icon =
    status === 2
      ? "check-circle-outline"
      : status === 1
      ? "progress-clock"
      : "checkbox-blank-circle-outline";

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Title
          title={title}
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
    
          <ProgressBar
            progress={progress}
            color={statusColor}
            style={styles.progress}
          />

          <Text
            style={{
              color: theme.colors.onSurfaceVariant,
              marginTop: 4,
            }}
          >
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