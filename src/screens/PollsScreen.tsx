import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

export default function PollsScreen() {
  const [polls, setPolls] = useState([
    { id: '1', question: 'Do you think public transport fares should be reduced during peak hours?', votesYes: 12, votesNo: 3 },
    { id: '2', question: 'Do you support expanding bike lanes in the city center?', votesYes: 27, votesNo: 10 },
    { id: '3', question: 'Should the town invest in more public recycling bins?', votesYes: 19, votesNo: 2 },
  ]);

  const castVote = (id: string, type: string) => {
    setPolls(prev => prev.map(p => p.id === id ? {
      ...p,
      votesYes: type === 'yes' ? p.votesYes + 1 : p.votesYes,
      votesNo: type === 'no' ? p.votesNo + 1 : p.votesNo,
    } : p));
  };

  type Poll = { id: string; question: string; votesYes: number; votesNo: number };

  const renderPoll = ({ item }: { item: Poll }) => (
    <View style={styles.pollCard}>
      <Text style={styles.question}>{item.question}</Text>
      <View style={styles.voteRow}>
        <TouchableOpacity style={styles.voteButton} onPress={() => castVote(item.id, 'yes')}>
          <Text style={styles.voteText}>Yes ({item.votesYes})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.voteButton, styles.noButton]} onPress={() => castVote(item.id, 'no')}>
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
        keyExtractor={(item) => item.id}
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
  question: { fontSize: 18, marginBottom: 12, color: '#1a237e' },
  voteRow: { flexDirection: 'row', justifyContent: 'space-between' },
  voteButton: { backgroundColor: '#3949ab', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  noButton: { backgroundColor: '#1a237e' },
  voteText: { color: 'white', fontWeight: 'bold' },
});