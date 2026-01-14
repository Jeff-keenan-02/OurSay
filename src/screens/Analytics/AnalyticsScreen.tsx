import React, { useContext, useCallback } from "react";
import { View } from "react-native";
import { Text, useTheme, Divider } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";

import { Screen } from "../../layout/Screen";
import { Section } from "../../layout/Section";
import { typography } from "../../theme/typography";
import { AuthContext } from "../../context/AuthContext";

/**
 * AnalyticsScreen
 * Displays high-level civic engagement statistics
 */
export default function AnalyticsScreen() {
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  // TODO: Replace with real API calls later
  const mockStats = {
    pollsParticipated: 12,
    discussionsJoined: 7,
    votesCast: 34,
    totalUsers: 1842,
    activePolls: 5,
  };

  useFocusEffect(
    useCallback(() => {
      // Future: fetch analytics data here
    }, [])
  );

  return (
    <Screen
      scroll
      title="Analytics"
      subtitle="Insights into civic participation on OurSay"
    >
      {/* Personal Engagement */}
      <Section label="Your Participation">
        <StatRow label="Polls participated in" value={mockStats.pollsParticipated} />
        <Divider />
        <StatRow label="Discussions joined" value={mockStats.discussionsJoined} />
        <Divider />
        <StatRow label="Votes cast" value={mockStats.votesCast} />
      </Section>

      {/* Platform Overview */}
      <Section label="Platform Overview">
        <StatRow label="Registered users" value={mockStats.totalUsers} />
        <Divider />
        <StatRow label="Active polls this week" value={mockStats.activePolls} />
      </Section>

      {/* Privacy Note */}
      <Section label="Privacy Notice">
        <Text
          style={[
            typography.body,
            { color: theme.colors.onSurfaceVariant }
          ]}
        >
          All analytics are aggregated and anonymised. No individual voting
          behaviour is ever disclosed.
        </Text>
      </Section>
    </Screen>
  );
}

/**
 * Reusable stat row component
 */
function StatRow({ label, value }: { label: string; value: number }) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
      }}
    >
      <Text
        style={[
          typography.body,
          { color: theme.colors.onSurfaceVariant }
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          typography.subtitle,
          { color: theme.colors.onBackground }
        ]}
      >
        {value}
      </Text>
    </View>
  );
}