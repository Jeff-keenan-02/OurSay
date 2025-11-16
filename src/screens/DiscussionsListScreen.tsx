import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type Discussion = {
  id: number;
  title: string;
  body: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
};

type RootStackParamList = {
  DiscussionDetail: { id: number };
};

export default function DiscussionsListScreen() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const API_BASE = 'http://localhost:3000'; // iOS simulator is fine; Android = 10.0.2.2

  const loadDiscussions = () => {
    fetch(`${API_BASE}/discussions`)
      .then(res => res.json() as Promise<Discussion[]>)
      .then(data => setDiscussions(data))
      .catch(err => console.error('Error fetching discussions:', err));
  };

  useEffect(() => {
    loadDiscussions();
  }, []);

  const openDiscussion = (id: number) => {
    navigation.navigate('DiscussionDetail', { id });
  };

  const sendVote = async (id: number, direction: 'up' | 'down') => {
    try {
      // TODO: replace hardcoded 1 with logged-in user id once auth is wired
      const res = await fetch(`${API_BASE}/discussions/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1, direction })
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.warn('Vote failed:', errBody);
        return;
      }

      const updated = await res.json(); // { id, upvotes, downvotes }

      // Update local state so UI reflects new counts
      setDiscussions(prev =>
        prev.map(d =>
          d.id === updated.id
            ? { ...d, upvotes: updated.upvotes, downvotes: updated.downvotes }
            : d
        )
      );
    } catch (e) {
      console.error('Error sending vote:', e);
    }
  };

  const renderItem = ({ item }: { item: Discussion }) => (
    <TouchableOpacity style={styles.card} onPress={() => openDiscussion(item.id)}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.content} numberOfLines={2}>
        {item.body}
      </Text>

      <View style={styles.row}>
        <View style={styles.voteRow}>
          <TouchableOpacity
            style={styles.voteButton}
            onPress={() => sendVote(item.id, 'up')}
          >
            <Text style={styles.voteText}>👍 {item.upvotes}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.voteButton, styles.downvoteButton]}
            onPress={() => sendVote(item.id, 'down')}
          >
            <Text style={styles.voteText}>👎 {item.downvotes}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.meta}>💬 {item.comment_count}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={discussions}
        renderItem={renderItem}
        keyExtractor={i => i.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef2ff', padding: 16 },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 6, color: '#1a237e' },
  content: { fontSize: 14, color: '#444' },
  row: { flexDirection: 'row', marginTop: 10, justifyContent: 'space-between', alignItems: 'center' },
  voteRow: { flexDirection: 'row', gap: 8 },
  voteButton: {
    backgroundColor: '#3949ab',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8
  },
  downvoteButton: {
    backgroundColor: '#1a237e'
  },
  voteText: { color: 'white', fontWeight: 'bold' },
  meta: { color: '#555', fontWeight: '600' }
});