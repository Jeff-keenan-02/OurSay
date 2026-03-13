import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native";
import { Card, ProgressBar, useTheme } from "react-native-paper";
import { WeeklyCardData } from "../../types/WeeklyCardData";
import { PollAccessState } from "../../utils/pollAccess";

type Props = {
  data: WeeklyCardData;
  onPress: () => void;
  state?: PollAccessState;
};

export function WeeklyEngagementCard({
  data,
  onPress,
  state = "available",
}: Props) {
  const theme = useTheme();

  const isPoll = data.type === "poll";

  const isLocked = isPoll && state === "locked";
  const isCompleted = isPoll && state === "completed";
  const isDisabled = isLocked || isCompleted;

  const renderStatusBadge = () => {
    if (!isPoll) return null;

    if (isLocked) {
      return (
        <Text style={[styles.statusText, { color: theme.colors.error }]}>
          🔒 Verification required
        </Text>
      );
    }

    if (isCompleted) {
      return (
        <Text style={[styles.statusText, { color: "#4caf50" }]}>
          ✅ Completed — Participation recorded
        </Text>
      );
    }

    return null;
  };

  const renderFooter = () => {
    switch (data.type) {
      case "discussion":
        return (
          <View style={styles.footerRow}>
            <Text style={[styles.metaText, { color: theme.colors.primary }]}>
              {data.footerText}
            </Text>
            <Text style={[styles.metaText, { color: theme.colors.primary }]}>
              Created by {data.createdBy}
            </Text>
          </View>
        );

      case "poll":
        return (
          <Text style={[styles.metaText, { color: theme.colors.primary }]}>
            {data.footerText}
          </Text>
        );

      case "petition":
        return (
          <View style={styles.footerRow}>
            <Text
              style={[
                styles.metaText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {data.signatures} signatures
            </Text>
            <Text
              style={[
                styles.metaText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Goal: {data.signature_goal}
            </Text>
          </View>
        );
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.9}
    >
      <Card
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            opacity: isDisabled ? 0.65 : 1,
          },
        ]}
      >
        <Card.Title
          title={data.label}
          subtitle={data.title}
          titleStyle={{
            color: theme.colors.primary,
            fontWeight: "700",
          }}
        />

        {renderStatusBadge()}

        <Card.Content>
          {"description" in data && (
            <View style={styles.descriptionContainer}>
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                style={[
                  styles.description,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {data.description}
              </Text>
            </View>
          )}

          {"progress" in data && (
            <ProgressBar
              progress={data.progress}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
          )}

          {renderFooter()}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 14,
  },

  statusText: {
    fontWeight: "600",
    marginBottom: 8,
  },

  descriptionContainer: {
    minHeight: 42,
    marginBottom: 8,
  },

  description: {
    fontSize: 14,
  },

  progressBar: {
    height: 8,
    borderRadius: 6,
    marginBottom: 8,
  },

  footerRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  metaText: {
    fontSize: 12,
    opacity: 0.7,
  },
});