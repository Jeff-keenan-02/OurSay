import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";


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
  const API = "http://localhost:3000";

  const loadPolls = () => {
    fetch(`${API}/polls`)
      .then(res => res.json())
      .then(data => setPolls(data))
      .catch(err => console.error("Error fetching polls:", err));
  };

  useEffect(() => {
    loadPolls();
  }, []);

  const castVote = async (id: number, choice: "yes" | "no") => {
    if (!user) {
      alert("You must be logged in to vote.");
      return;
   }
    try {
      await fetch(`${API}/polls/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, choice })
      });

      loadPolls();
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const renderPoll = ({ item }: { item: Poll }) => (
    <View style={styles.pollCard}>
      <Text style={styles.question}>{item.title}</Text>
      {item.description && <Text style={styles.description}>{item.description}</Text>}

      <View style={styles.voteRow}>
        <TouchableOpacity style={styles.voteButton} onPress={() => castVote(item.id, "yes")}>
          <Text style={styles.voteText}>Yes ({item.votes_yes})</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.voteButton, styles.noButton]} onPress={() => castVote(item.id, "no")}>
          <Text style={styles.voteText}>No ({item.votes_no})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community Polls</Text>
      <FlatList
        data={polls}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPoll}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a237e', marginBottom: 20, textAlign: 'center' },
  pollCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2 },
  question: { fontSize: 18, marginBottom: 6, color: '#1a237e', fontWeight: '600' },
  description: { fontSize: 14, marginBottom: 12, color: '#555' },
  voteRow: { flexDirection: 'row', justifyContent: 'space-between' },
  voteButton: { backgroundColor: '#3949ab', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  noButton: { backgroundColor: '#1a237e' },
  voteText: { color: 'white', fontWeight: 'bold' },
});

function alert(arg0: string) {
  throw new Error('Function not implemented.');
}
