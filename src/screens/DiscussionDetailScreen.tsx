import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";

type RootStackParamList = {
  DiscussionDetail: { id: number };
};

type Comment = {
  id: number;
  body: string;
  created_at: string;
  username: string | null;  // <-- added username
};

type Discussion = {
  id: number;
  title: string;
  body: string;
  comments: Comment[];
};

// Format timestamps like “3m ago”
function timeAgo(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export default function DiscussionDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "DiscussionDetail">>();
  const { id } = route.params;

  const { user } = useContext(AuthContext);

  
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [newComment, setNewComment] = useState("");

  const API_BASE = "http://localhost:3000";

  // Load discussion + comments
  const loadDiscussion = () => {
    fetch(`${API_BASE}/discussions/${id}`)
      .then((res) => res.json())
      .then((data) => setDiscussion(data))
      .catch((err) => console.error("Error loading discussion:", err));
  };

  useEffect(() => {
    loadDiscussion();
  }, []);

  // Submit a new comment
  const submitComment = () => {
    if (!newComment.trim()) return;

    if (!user) {  
      alert("You must be logged in to comment.");
      return;
    } 
    fetch(`${API_BASE}/discussions/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body: newComment,
        userId: user.id,
      }),
    })
      .then(() => {
        setNewComment("");
        loadDiscussion();
      })
      .catch((err) => console.error("Error posting comment:", err));
  };

  if (!discussion) return <Text style={{ padding: 20 }}>Loading...</Text>;

  return (
    <View style={styles.container}>
      {/* Main Post */}
      <View style={styles.postCard}>
        <Text style={styles.title}>{discussion.title}</Text>
        <Text style={styles.body}>{discussion.body}</Text>
      </View>

      <Text style={styles.commentsHeader}>Comments</Text>

      {/* Comments List */}
      <FlatList
        data={discussion.comments}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 90 }}
        renderItem={({ item }) => (
          <View style={styles.commentCard}>
            <View style={styles.commentHeader}>
              <Text style={styles.username}>
                {item.username ?? "Anonymous"}
              </Text>
              <Text style={styles.commentTime}>
                {timeAgo(item.created_at)}
              </Text>
            </View>

            <Text style={styles.commentText}>{item.body}</Text>
          </View>
        )}
      />

      {/* Comment Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          value={newComment}
          onChangeText={setNewComment}
          style={styles.input}
          placeholder="Write a comment..."
          placeholderTextColor="#777"
        />

        <TouchableOpacity style={styles.button} onPress={submitComment}>
          <Text style={styles.buttonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2ff" },

  postCard: {
    backgroundColor: "white",
    padding: 16,
    margin: 12,
    borderRadius: 12,
    elevation: 2,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#1a237e", marginBottom: 8 },
  body: { fontSize: 16, color: "#333" },

  commentsHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginStart: 16,
    marginVertical: 10,
    color: "#1a237e",
  },

  commentCard: {
    backgroundColor: "white",
    padding: 14,
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 1,
  },

  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  username: {
    fontWeight: "700",
    color: "#3949ab",
  },

  commentText: { fontSize: 15, color: "#333", marginTop: 2 },

  commentTime: {
    fontSize: 12,
    color: "#666",
  },

  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ccc",
  },

  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15,
    marginRight: 8,
  },

  button: {
    backgroundColor: "#3949ab",
    paddingHorizontal: 18,
    justifyContent: "center",
    borderRadius: 25,
  },
  buttonText: { color: "white", fontWeight: "600" },
});

function alert(arg0: string) {
  throw new Error("Function not implemented.");
}
