import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Card, Text, ProgressBar, List, useTheme } from "react-native-paper";
import { PollGroup } from "../../types/PollGroup";
import { FeatureAccessState } from "../../utils/accessTypes";

type Props = {
  group: PollGroup;
  state: FeatureAccessState; // only "locked_verification" | "available"
  onPress: () => void;
};

export default function PollGroupCard({
  group,
  state,
  onPress,
}: Props) {
  const theme = useTheme();

  const {
    title,
    status,
    progress,
    completed_polls,
    total_polls,
  } = group;

  /* ----------------------------------------
     Access Logic (verification only)
  ---------------------------------------- */

  const isVerificationLocked = state === "locked_verification";

  /* ----------------------------------------
     Progress Logic (business state)
  ---------------------------------------- */

  const isCompleted = status === 2;

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

  /* ----------------------------------------
     Final Interaction Rule
  ---------------------------------------- */

  const disabled = isVerificationLocked || isCompleted;

  /* ----------------------------------------
     Render
  ---------------------------------------- */

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      activeOpacity={disabled ? 1 : 0.8}
    >
      <Card
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            opacity: isVerificationLocked ? 0.5 : 1,
          },
        ]}
      >
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
          right={() => {
            if (isVerificationLocked) {
              return <List.Icon icon="lock-outline" />;
            }

            if (isCompleted) {
              return (
                <List.Icon
                  icon="check-circle"
                  color="#4caf50"
                />
              );
            }

            return null;
          }}
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

          {isVerificationLocked && (
            <Text
              style={{
                marginTop: 6,
                color: theme.colors.error,
              }}
            >
              Verification required
            </Text>
          )}
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