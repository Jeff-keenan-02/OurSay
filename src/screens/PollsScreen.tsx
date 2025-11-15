import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

type Poll = {
  id: number;
  title: string;
  description: string | null;
  votesYes: number;
  votesNo: number;
};

export default function PollsScreen() {
  const [polls, setPolls] = useState<Poll[]>([]);

  // Load data from backend
  useEffect(() => {
    fetch("http://localhost:3000/polls")
      .then(res => res.json())
      .then(data => {
        // Add vote fields so UI works
        const pollsWithVotes = data.map((p: any) => ({
          ...p,
          votesYes: 0,
          votesNo: 0
        }));
        setPolls(pollsWithVotes);
      })
      .catch(err => console.error("Error fetching polls:", err));
  }, []);

  // Handle votes (local only for now)
  const castVote = (id: number, type: "yes" | "no") => {
    setPolls(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              votesYes: type === "yes" ? p.votesYes + 1 : p.votesYes,
              votesNo: type === "no" ? p.votesNo + 1 : p.votesNo
            }
          : p
      )
    );
  };

  const renderPoll = ({ item }: { item: Poll }) => (
    <View style={styles.pollCard}>
      <Text style={styles.question}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.voteRow}>
        <TouchableOpacity style={styles.voteButton} onPress={() => castVote(item.id, "yes")}>
          <Text style={styles.voteText}>Yes ({item.votesYes})</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.voteButton, styles.noButton]} onPress={() => castVote(item.id, "no")}>
          <Text style={styles.voteText}>No ({item.votesNo})</Text>
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