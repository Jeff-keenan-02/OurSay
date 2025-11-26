import React, { useEffect, useState, useContext } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { globalStyles } from "../theme/globalStyles";

import {
  Text,
  Card,
  Button,
  Divider,
  useTheme,
} from "react-native-paper";


type Poll = {
  id: number;
  title: string;
  description: string | null;
  votes_yes: number;
  votes_no: number;
};

export default function PollsScreen() {
  const { user } = useContext(AuthContext);
  const [polls, setPolls] = useState<Poll[]>([]);
  const theme = useTheme();

  const API = "http://localhost:3000";

  const loadPolls = () => {
    fetch(`${API}/polls`)
      .then((res) => res.json())
      .then((data) => setPolls(data))
      .catch((err) => console.error("Error fetching polls:", err));
  };

  useEffect(() => {
    loadPolls();
  }, []);

  const castVote = async (id: number, choice: "yes" | "no") => {
    if (!user) return alert("You must be logged in to vote.");

    try {
      await fetch(`${API}/polls/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, choice }),
      });

      loadPolls();
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const renderPoll = ({ item }: { item: Poll }) => (
    <Card
      mode="flat"
      style={[
        globalStyles.card,
        styles.pollCard,
        { backgroundColor: "#1E2A3A" }, // <--- CHANGE COLOUR HERE
      ]}
      theme={{ roundness: 18 }}
    >
      <Text
        variant="titleMedium"
        style={[
          styles.pollTitle,
          { color: theme.colors.onSurface, marginBottom: 4, flexWrap: "wrap" }
        ]}
      >
      {item.title}
      </Text>
      <Card.Content style={styles.cardInner}>
        {item.description && (
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            {item.description}
          </Text>
        )}

        <Divider style={{ marginVertical: 14 }} />

        {/* Buttons Row */}
        <View style={styles.voteRow}>
          <Button
            mode="contained"
            onPress={() => castVote(item.id, "yes")}
            style={globalStyles.button}
    
          >
            Yes ({item.votes_yes})
          </Button>

          <Button
            mode="contained"
            buttonColor="#b54949"
            onPress={() => castVote(item.id, "no")}
            style={globalStyles.button}
          >
            No ({item.votes_no})
          </Button>
        </View>
      </Card.Content>
    </Card>

  );

  return (
  <View
      style={[
        globalStyles.screen,
        { backgroundColor: theme.colors.background },
      ]}
    >

        <Text
    variant="headlineMedium"
    style={{
      color: theme.colors.onBackground,
      textAlign: "center",
      marginBottom: 6,
      fontWeight: "700",
    }}
  >
    Community Polls
  </Text>
  
  <Text
    variant="bodyMedium"
    style={{
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
      marginBottom: 20,
    }}
  >
    Vote on polls today to have your voice heard!
  </Text>

      <FlatList
        style={{ backgroundColor: theme.colors.background }} // fix blur issues
        data={polls}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPoll}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

// --- Local styles (unique to this screen only) ---
const styles = StyleSheet.create({
  title: {
    color: "#e0e0e0",
    textAlign: "center",
    marginBottom: 20,
  },

  pollTitle: {
    color: "#e0e0e0",
    fontSize: 20,
    fontWeight: "600",
  },
  description: {
    color: "#c2c2c2",
    marginBottom: 10,
  },
  voteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pollCard: {
  marginBottom: 20,
  borderRadius: 30,
  paddingTop: 20,
  paddingBottom: 10,
  paddingHorizontal: 14,  
  borderColor: "#ffffff22", // very subtle white border
  borderWidth: 1,
  },
  cardInner: {
    paddingHorizontal: 0,
    paddingBottom: 14,
    paddingTop: 20,  
  },
});

function alert(arg0: string) {
  throw new Error("Function not implemented.");
}
