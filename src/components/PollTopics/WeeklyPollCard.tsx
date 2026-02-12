import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Card, Text, ProgressBar, useTheme } from "react-native-paper";
import { PollGroup } from "../../types/PollGroup";

type Props = {
  poll: PollGroup;
  onPress: () => void;
};

export default function WeeklyPollCard({ poll, onPress }: Props) {
  const theme = useTheme();

  const progress = poll.total_polls === 0 ? 0 : poll.completed_polls / poll.total_polls;

  return (
    <TouchableOpacity onPress={onPress}>
      <Card
        style={[
          styles.card,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <Card.Title
          title="Weekly Public Opinion Poll"
          titleStyle={{
            color: theme.colors.primary,
            fontSize: 18,
            fontWeight: "700",
          }}
          subtitle={poll.title}
          subtitleStyle={{
            color: theme.colors.onSurfaceVariant,
            fontSize: 16,
            marginTop: 2,
          }}
        />

        <Card.Content>
          {poll.description && (
            <Text
              style={{
                color: theme.colors.onSurfaceVariant,
                marginBottom: 10,
              }}
            >
              {poll.description}
            </Text>
          )}

          <ProgressBar
            progress={progress}
            color={theme.colors.primary}
            style={{ height: 8, borderRadius: 6 }}
          />

          <Text
            style={{
              color: theme.colors.onSurfaceVariant,
              marginTop: 6,
            }}
          >
            {poll.completed_polls}/{poll.total_polls} questions answered
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    elevation: 2,
  },
});