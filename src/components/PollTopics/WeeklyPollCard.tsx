import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Card, Text, ProgressBar, useTheme } from "react-native-paper";

/**
 * Props definition for WeeklyPollCard.
 * This ensures:
 *  - The card gets the poll data it needs (title, description, progress).
 *  - The parent screen can decide what happens when the card is clicked (onPress).
 *
 * Component props = clean separation from app logic.
 */
type Props = {
  poll: {
    id: number;
    title: string;
    description: string;
    total_polls: number;
    completed_polls: number;
  };
  onPress: () => void;
};

export default function WeeklyPollCard({ poll, onPress }: Props) {
  const theme = useTheme(); // gets the app’s theme — consistent light/dark mode colors

  /**
   * Calculate progress percentage for the progress bar.
   * Example:
   * 3 answered out of 6 => 0.5 (50%)
   */
  const progress =
    poll.total_polls === 0 ? 0 : poll.completed_polls / poll.total_polls;

  return (
    /**
     * TouchableOpacity means:
     *  - The entire card is clickable
     *  - Pressing it can navigate the user to the weekly poll swipe screen
     */
    <TouchableOpacity onPress={onPress}>
      <Card
        style={[
          styles.card,
          // Use theme color so the card always matches the app’s design system
          { backgroundColor: theme.colors.surfaceVariant }
        ]}
      >
        {/* Card header with the main and subtitle text */}
        <Card.Title
          title="Weekly Public Opinion Poll"      // static title (always the same)
          titleStyle={{
            color: theme.colors.primary,
            fontSize: 18,
            fontWeight: "700",
          }}
          subtitle={poll.title}                   // dynamic title for this week's poll
          subtitleStyle={{
            color: theme.colors.onSurfaceVariant,
            fontSize: 16,
            marginTop: 2,
          }}
        />

        <Card.Content>
          {/* Poll description */}
          <Text
            style={{
              color: theme.colors.onSurfaceVariant,
              marginBottom: 10,
            }}
          >
            {poll.description}
          </Text>

          {/* Progress bar showing how many questions the user answered */}
          <ProgressBar
            progress={progress}
            color={theme.colors.primary}
            style={{ height: 8, borderRadius: 6 }}
          />

          {/* Completed questions label */}
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
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    paddingBottom: 10,
  },
});