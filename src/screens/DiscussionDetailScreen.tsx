// import React, { useContext, useEffect, useState } from "react";
// import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from "react-native";
// import { RouteProp, useRoute } from "@react-navigation/native";
// import { AuthContext } from "../context/AuthContext";
// import { globalStyles } from "../theme/globalStyles";

// import {
//   Text,
//   Card,
//   TextInput,
//   Button,
//   Divider,
// } from "react-native-paper";

// type RootStackParamList = {
//   DiscussionDetail: { id: number };
// };

// type Comment = {
//   id: number;
//   body: string;
//   created_at: string;
//   username: string | null;
// };

// type Discussion = {
//   id: number;
//   title: string;
//   body: string;
//   comments: Comment[];
// };

// function timeAgo(timestamp: string) {
//   const date = new Date(timestamp);
//   const now = new Date();
//   const diffMs = now.getTime() - date.getTime();
//   const diffMin = Math.floor(diffMs / 60000);

//   if (diffMin < 1) return "just now";
//   if (diffMin < 60) return `${diffMin}m ago`;
//   const diffHr = Math.floor(diffMin / 60);
//   if (diffHr < 24) return `${diffHr}h ago`;
//   const diffDay = Math.floor(diffHr / 24);
//   return `${diffDay}d ago`;
// }

// export default function DiscussionDetailScreen() {
//   const route = useRoute<RouteProp<RootStackParamList, "DiscussionDetail">>();
//   const { id } = route.params;

//   const { user } = useContext(AuthContext);

//   const [discussion, setDiscussion] = useState<Discussion | null>(null);
//   const [newComment, setNewComment] = useState("");

//   const API_BASE = "http://localhost:3000";

//   const loadDiscussion = () => {
//     fetch(`${API_BASE}/discussions/${id}`)
//       .then((res) => res.json())
//       .then((data) => setDiscussion(data))
//       .catch((err) => console.error("Error loading discussion:", err));
//   };

//   useEffect(() => {
//     loadDiscussion();
//   }, []);

//   const submitComment = () => {
//     if (!newComment.trim()) return;

//     if (!user) {
//       alert("You must be logged in to comment.");
//       return;
//     }

//     fetch(`${API_BASE}/discussions/${id}/comments`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         body: newComment,
//         userId: user.id,
//       }),
//     })
//       .then(() => {
//         setNewComment("");
//         loadDiscussion();
//       })
//       .catch((err) => console.error("Error posting comment:", err));
//   };

//   if (!discussion) {
//     return (
//       <View style={globalStyles.screen}>
//         <Text style={{ color: "#e0e0e0" }}>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//         style={globalStyles.screen}
//       >
//         {/* Main Discussion Post */}
//         <Card mode="elevated" style={[styles.postCard]}>
//           <Card.Title
//             title={discussion.title}
//             titleStyle={styles.title}
//           />
//           <Card.Content>
//             <Text style={styles.body}>{discussion.body}</Text>
//           </Card.Content>
//         </Card>

//         <Text style={styles.commentsHeader}>Comments</Text>

//         {/* Comment List */}
//         <FlatList
//           data={discussion.comments}
//           keyExtractor={(item) => item.id.toString()}
//           contentContainerStyle={{ paddingBottom: 100 }}
//           renderItem={({ item }) => (
//             <Card mode="elevated" style={[styles.commentCard]}>
//               <Card.Content>
//                 <View style={styles.commentHeader}>
//                   <Text style={styles.username}>{item.username ?? "Anonymous"}</Text>
//                   <Text style={styles.commentTime}>{timeAgo(item.created_at)}</Text>
//                 </View>

//                 <Divider style={{ marginVertical: 8 }} />

//                 <Text style={styles.commentText}>{item.body}</Text>
//               </Card.Content>
//             </Card>
//           )}
//         />
//       </KeyboardAvoidingView>

//       {/* Comment Input */}
//       <View style={styles.inputContainer}>
//         <TextInput
//           mode="flat"
//           value={newComment}
//           onChangeText={setNewComment}
//           placeholder="Write a comment..."
//           placeholderTextColor="#888"
//           style={styles.input}
//         />

//         <Button
//           mode="contained"
//           onPress={submitComment}
//           style={styles.postButton}
//         >
//           Post
//         </Button>
//       </View>
//     </>
//   );
// }

// // ---------- LOCAL STYLES (screen-specific only) ----------
// const styles = StyleSheet.create({
//   postCard: {
//     marginBottom: 12,
//   },
//   title: {
//     color: "#e0e0e0",
//     fontSize: 22,
//     fontWeight: "700",
//   },
//   body: {
//     color: "#c2c2c2",
//     fontSize: 16,
//     marginTop: 6,
//   },

//   commentsHeader: {
//     marginHorizontal: 16,
//     marginTop: 10,
//     marginBottom: 8,
//     color: "#e0e0e0",
//     fontSize: 18,
//     fontWeight: "600",
//   },

//   commentCard: {
//     marginHorizontal: 16,
//     marginBottom: 12,
//   },

//   commentHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },

//   username: {
//     color: "#4ea3ff",
//     fontWeight: "700",
//   },

//   commentTime: {
//     color: "#999",
//     fontSize: 12,
//   },

//   commentText: {
//     color: "#e0e0e0",
//     marginTop: 4,
//   },

//   inputContainer: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     flexDirection: "row",
//     padding: 12,
//     backgroundColor: "#2b2b2b",
//     borderTopWidth: 1,
//     borderColor: "#3b3b3b",
//   },

//   input: {
//     flex: 1,
//     backgroundColor: "#1e1e1e",
//     color: "#e0e0e0",
//     marginRight: 10,
//     borderRadius: 6,
//   },

//   postButton: {
//     alignSelf: "center",
//     borderRadius: 8,
//   },
// });

// function alert(arg0: string) {
//   throw new Error("Function not implemented.");
// }
import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { globalStyles } from "../theme/globalStyles";
import {
  Text,
  Card,
  TextInput,
  Button,
  Divider,
  useTheme,
} from "react-native-paper";

type RootStackParamList = {
  DiscussionDetail: { id: number };
};

function timeAgo(ts: string) {
  const date = new Date(ts);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const hr = Math.floor(diffMin / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export default function DiscussionDetailScreen() {
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  const route = useRoute<RouteProp<RootStackParamList, "DiscussionDetail">>();
  const { id } = route.params;

  const [discussion, setDiscussion] = useState<any>(null);
  const [newComment, setNewComment] = useState("");

  const API = "http://localhost:3000";

  const loadDiscussion = () => {
    fetch(`${API}/discussions/${id}`)
      .then((res) => res.json())
      .then((data) => setDiscussion(data))
      .catch(console.error);
  };

  useEffect(() => loadDiscussion(), []);

  const submitComment = () => {
    if (!newComment.trim()) return;

    if (!user) {
      alert("You must be logged in to comment.");
      return;
    }

    fetch(`${API}/discussions/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: newComment, userId: user.id }),
    })
      .then(() => {
        setNewComment("");
        loadDiscussion();
      })
      .catch(console.error);
  };

  if (!discussion) return (
    <View style={globalStyles.screen}>
      <Text style={{ color: theme.colors.onBackground }}>Loading…</Text>
    </View>
  );

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[globalStyles.screen, { backgroundColor: theme.colors.background }]}
      >
        <FlatList
          data={discussion.comments}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 120 }} // Ensure space for input bar
          ListHeaderComponent={
            <View>
                {/* --- Main Post Header --- */}
                <View style={styles.headerWrapper}>
                    <Text style={[styles.title, { color: theme.colors.onBackground }]}>
                        {discussion.title}
                    </Text>
                    <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                        Posted by {discussion.username ?? "Anonymous"} • {timeAgo(discussion.created_at)}
                    </Text>
                </View>

                {/* --- Post Body Card (Lighter surface color) --- */}
                <Card mode="elevated" style={[styles.bodyCard, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <Text style={[styles.bodyText, { color: theme.colors.onSurface }]}>
                            {discussion.body}
                        </Text>
                    </Card.Content>
                </Card>
                
                {/* --- Divider and Comment Header --- */}
                <View style={[styles.sectionDivider, { backgroundColor: theme.colors.outline }]} />
                <Text style={[styles.commentsHeader, { color: theme.colors.onBackground }]}>
                    Comments ({discussion.comments.length})
                </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View 
                style={[
                    styles.commentBlock, 
                    { 
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.outline,
                    }
                ]}
            >
              <View style={styles.commentHeader}>
                {/* Use primary color for username to give it distinction */}
                <Text style={[styles.commentAuthor, { color: theme.colors.primary }]}>
                    {item.username ?? "Anonymous"}
                </Text>
                <Text style={[styles.commentTime, { color: theme.colors.onSurfaceVariant }]}>
                    {timeAgo(item.created_at)}
                </Text>
              </View>
              <Text style={[styles.commentText, { color: theme.colors.onSurface }]}>{item.body}</Text>
            </View>
          )}
        />
      </KeyboardAvoidingView>

      {/* --- Comment Input Bar (Sticky Footer) --- */}
      <View style={[styles.inputContainer, { 
          backgroundColor: theme.colors.surface, // Match card color for seamless look
          borderColor: theme.colors.outline,
      }]}>
        <TextInput
          mode="flat"
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Write a comment…"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          style={[styles.input, { backgroundColor: theme.colors.background }]}
        />
        <Button mode="contained" onPress={submitComment} style={styles.postButton}>
          Post
        </Button>
      </View>
    </>
  );
}

// --- LOCAL STYLES (screen-specific only) ---
const styles = StyleSheet.create({
  headerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
  },
  bodyCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 22,
  },
  commentsHeader: {
    marginLeft: 16,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "700",
  },
  sectionDivider: {
    height: 1,
    width: "100%",
    opacity: 0.5,
    marginTop: 10,
    marginBottom: 8,
  },
  
  // Cleaned up Comment Block (Reddit-inspired)
  commentBlock: {
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    // No explicit colors here, they come from inline theme application
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentAuthor: {
    fontWeight: "600",
  },
  commentTime: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 20,
  },
  
  // Sticky Input Bar
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    elevation: 10, // Shadow for Android
    shadowOpacity: 0.1, // Shadow for iOS
  },
  input: {
    flex: 1,
    borderRadius: 8,
    marginRight: 8,
    minHeight: 45,
    paddingHorizontal: 10,
  },
  postButton: {
    alignSelf: "center",
    borderRadius: 8,
    height: 45,
    justifyContent: 'center'
  },
});

function alert(arg0: string) {
  throw new Error("Function not implemented.");
}
