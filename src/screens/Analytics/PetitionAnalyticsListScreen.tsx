import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Card, Avatar } from "react-native-paper";
import { Screen } from "../../layout/Screen";
import { spacing } from "../../theme/spacing";
import { useApiClient } from "../../hooks/common/useApiClient";

export default function PetitionAnalyticsListScreen({ navigation }: any) {
  const api = useApiClient();

  type Petition = {
    id: number;
    title: string;
    topic: string;
  };

  const [petitions, setPetitions] = useState<Petition[]>([]);

  useEffect(() => {
    api.get("/analytics/petitions").then((res: any) => {
      setPetitions(res);
    });
  }, []);

  return (
    <Screen
      scroll
      title="Petition Analytics"
      subtitle="Select a petition to view aggregated support."
    >
      <View style={styles.container}>
        {petitions.map((petition) => (
          <TouchableOpacity
            key={petition.id}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("PetitionAnalyticsDetail", {
                petitionId: petition.id,
              })
            }
          >
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                
                {/* Icon */}
                <Avatar.Icon
                  icon="file-document-outline"
                  size={40}
                  style={styles.icon}
                />

                {/* Text */}
                <View style={styles.textContainer}>
                  <Text style={styles.title}>
                    {petition.title}
                  </Text>
                  <Text style={styles.topic}>
                    {petition.topic}
                  </Text>
                </View>

                {/* Arrow */}
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

  title: {
    fontWeight: "600",
    fontSize: 15,
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