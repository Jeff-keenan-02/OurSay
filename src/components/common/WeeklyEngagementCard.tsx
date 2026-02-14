import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native";
import { Card, ProgressBar, useTheme } from "react-native-paper";
import { WeeklyCardData } from "../../types/WeeklyCardData";

type Props = {
  data: WeeklyCardData;
  onPress: () => void;
};

export function WeeklyEngagementCard({ data, onPress }: Props) {
  const theme = useTheme();

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
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Card
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface },
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

        <Card.Content>

          {/* Description Slot */}
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

          {/* Progress Slot */}
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

  descriptionContainer: {
    minHeight: 42, // ensures layout consistency
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