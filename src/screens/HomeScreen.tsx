// 
import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";

export default function HomeScreen() {
  const navigation: any = useNavigation();

  const [featuredPoll, setFeaturedPoll] = useState<any>(null);
  const [trendingDiscussions, setTrendingDiscussions] = useState<any[]>([]);

  const API = "http://localhost:3000";

  const { user } = useContext(AuthContext);   // user.id required

  const sendVote = async (id: number, direction: "up" | "down") => {
    if (!user) {
      alert("You must be logged in to vote");
      return;
    }
    try {
      const res = await fetch(`${API}/discussions/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, direction })
    });

    const updated = await res.json(); // { id, upvotes, downvotes }

    // update the trendingDiscussions list locally
    setTrendingDiscussions(prev =>
      prev.map(d =>
        d.id === updated.id
          ? { ...d, upvotes: updated.upvotes, downvotes: updated.downvotes }
          : d
      )
    );

  } catch (err) {
    console.error("Home vote error:", err);
  }
};

  useEffect(() => {
    fetch(`${API}/polls`)
      .then(res => res.json())
      .then(data => setFeaturedPoll(data[0]))  // top poll
      .catch(console.error);

    fetch(`${API}/discussions`)
      .then(res => res.json())
      .then(data => setTrendingDiscussions(data.slice(0, 3))) // top 3
      .catch(console.error);
  }, []);

  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.container}>

          {/* HEADER */}
          <Text style={styles.title}>OurSay</Text>
          <Text style={styles.subtitle}>Your voice. Your community.</Text>

          {/* FEATURED POLL */}
          {featuredPoll && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Featured Poll</Text>
              <Text style={styles.question}>{featuredPoll.title}</Text>

              {featuredPoll.description && (
                <Text style={styles.description}>{featuredPoll.description}</Text>
              )}

              <View style={styles.voteRow}>
                <TouchableOpacity
                  style={styles.voteButton}
                  onPress={() =>
                    navigation.navigate("Polls")
                  }
                >
                  <Text style={styles.voteText}>Vote Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* TRENDING DISCUSSIONS */}
          <Text style={styles.sectionTitle}>Trending Discussions</Text>
        </View>
      }
      data={trendingDiscussions}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.discussionCard}
          onPress={() =>
          navigation.navigate("Discuss", {
          screen: "DiscussionDetail",
          params: {
            id: item.id,
            title: item.title,
            fromHome: true
          }
        })
      }
        >
          <Text style={styles.discussionTitle}>{item.title}</Text>
          <Text numberOfLines={2} style={styles.discussionBody}>{item.body}</Text>

          <View style={styles.row}>
            {/* 👍 Upvote */}
            <TouchableOpacity onPress={() => sendVote(item.id, "up")}>
              <Text>👍 {item.upvotes}</Text>
            </TouchableOpacity>

            {/* 👎 Downvote */}
            <TouchableOpacity onPress={() => sendVote(item.id, "down")}>
              <Text>👎 {item.downvotes}</Text>
            </TouchableOpacity>

            <Text>💬 {item.comment_count}</Text>
          </View>
        </TouchableOpacity>
      )}
      ListFooterComponent={
        <View style={{ padding: 20 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Discuss")}
          >
            <Text style={styles.link}>See all discussions →</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 4, color: "#1a237e" },
  subtitle: { fontSize: 16, marginBottom: 20, color: "#555" },
  sectionTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: "#1a237e" },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  question: { fontSize: 18, fontWeight: "600", marginBottom: 6 },
  description: { color: "#555", marginBottom: 12 },
  voteRow: { flexDirection: "row", gap: 10 },
  voteButton: { backgroundColor: "#3949ab", padding: 12, borderRadius: 8 },
  voteText: { color: "white", fontWeight: "bold" },
  discussionCard: {
    backgroundColor: "white",
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 12,
    elevation: 2,
  },
  discussionTitle: { fontSize: 18, fontWeight: "bold", color: "#1a237e" },
  discussionBody: { color: "#444", marginVertical: 6 },
  row: { flexDirection: "row", gap: 10 },
  link: { color: "#3949ab", fontWeight: "600", textAlign: "center", fontSize: 16 },
});

function alert(arg0: string) {
  throw new Error("Function not implemented.");
}
