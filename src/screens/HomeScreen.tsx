import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { globalStyles } from "../theme/globalStyles";

import {
  Text,
  Card,
  Button,
  IconButton,
  Divider,
  useTheme,
} from "react-native-paper";

export default function HomeScreen() {
  const theme = useTheme();
  const navigation: any = useNavigation();
  const { user } = useContext(AuthContext);

  const [featuredPoll, setFeaturedPoll] = useState<any>(null);
  const [trendingDiscussions, setTrendingDiscussions] = useState<any[]>([]);

  const API = "http://localhost:3000";

  // -------------------------------
  // Voting logic
  // -------------------------------
  const sendVote = async (id: number, direction: "up" | "down") => {
    if (!user) return alert("You must be logged in to vote");

    try {
      const res = await fetch(`${API}/discussions/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, direction }),
      });

      const updated = await res.json();

      setTrendingDiscussions((prev) =>
        prev.map((d) => (d.id === updated.id ? { ...d, ...updated } : d))
      );
    } catch (err) {
      console.error("Vote error", err);
    }
  };

  // -------------------------------
  // Load polls + discussions
  // -------------------------------
  useEffect(() => {
    fetch(`${API}/polls`)
      .then((res) => res.json())
      .then((data) => setFeaturedPoll(data[0]))
      .catch(console.error);

    fetch(`${API}/discussions`)
      .then((res) => res.json())
      .then((data) => setTrendingDiscussions(data.slice(0, 3)))
      .catch(console.error);
  }, []);

  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingBottom: 40 }}
      ListHeaderComponent={
        <View
        style={[
          globalStyles.screen,
          { backgroundColor: theme.colors.background },
        ]}
      >
          {/* HEADER */}
          <Text variant="headlineLarge" style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
            OurSay
          </Text>

          <Text variant="bodyMedium" style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Your community. Your voice.
          </Text>

          {/* FEATURED POLL */}
          {featuredPoll && (
            <Card
              mode="elevated"
              style={[globalStyles.card, styles.card]}
              theme={{ colors: { surface: theme.colors.surface } }}
            >
              <Card.Title
                title="Featured Poll"
                titleStyle={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              />

              <Card.Content>
                <Text
                  variant="titleMedium"
                  style={[styles.pollTitle, { color: theme.colors.onSurface }]}
                >
                  {featuredPoll.title}
                </Text>

                {featuredPoll.description && (
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>
                    {featuredPoll.description}
                  </Text>
                )}

                <Button
                  mode="contained"
                  onPress={() => navigation.navigate("Polls")}
                  style={globalStyles.button}
                >
                  Vote Now
                </Button>
              </Card.Content>
            </Card>
          )}

          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.onBackground, marginTop: 20 },
            ]}
          >
            Trending Discussions
          </Text>
        </View>
      }
      data={trendingDiscussions}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.sectionWrapper}>
        <Card
          mode="elevated"
          style={[globalStyles.card, styles.card]}
          theme={{ colors: { surface: theme.colors.surface } }}
          onPress={() =>
            navigation.navigate("Discuss", {
              screen: "DiscussionDetail",
              params: { id: item.id, title: item.title },
            })
          }
        >
          <Card.Title
            title={item.title}
            titleStyle={{ color: theme.colors.onSurface }}
          />

          <Card.Content>
            <Text numberOfLines={3} style={{ color: theme.colors.onSurfaceVariant }}>
              {item.body}
            </Text>

            <Divider style={{ marginVertical: 10 }} />

            <View style={styles.row}>
              <IconButton
                icon="thumb-up"
                size={20}
                iconColor={theme.colors.primary}
                onPress={() => sendVote(item.id, "up")}
              />
              <Text style={{ color: theme.colors.onSurface }}>{item.upvotes}</Text>

              <IconButton
                icon="thumb-down"
                size={20}
                iconColor={theme.colors.primary}
                onPress={() => sendVote(item.id, "down")}
              />
              <Text style={{ color: theme.colors.onSurface }}>{item.downvotes}</Text>

              <IconButton
                icon="comment"
                size={20}
                iconColor={theme.colors.primary}
              />
              <Text style={{ color: theme.colors.onSurface }}>{item.comment_count}</Text>
            </View>
          </Card.Content>
        </Card>
        </View>

      )}
      ListFooterComponent={
        <View style={{ padding: 20 }}>
          <Button mode="text" onPress={() => navigation.navigate("Discuss")}>
            View All Discussions →
          </Button>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    textAlign: "center",
    marginBottom: 4,
  },
  headerSubtitle: {
    textAlign: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
  },
  pollTitle: {
    marginBottom: 6,
  },

sectionWrapper: {
  width: "100%",
  paddingHorizontal: 14,
  marginBottom: 20,
},

card: {
  width: "100%",
  borderRadius: 18,
  paddingBottom: 10,
  alignSelf: "center",
  backgroundColor: "rgba(255,255,255,0.04)",
},

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});

function alert(arg0: string) {
  throw new Error("Function not implemented.");
}
