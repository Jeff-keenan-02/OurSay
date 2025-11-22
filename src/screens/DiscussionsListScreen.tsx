// import React, { useContext, useEffect, useState } from "react";
// import { View, StyleSheet, FlatList } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { AuthContext } from "../context/AuthContext";
// import { globalStyles } from "../theme/globalStyles";

// import {
//   Text,
//   Card,
//   IconButton,
//   Divider,
//   useTheme
// } from "react-native-paper";

// type Discussion = {
//   id: number;
//   title: string;
//   body: string;
//   upvotes: number;
//   downvotes: number;
//   comment_count: number;
// };

// export default function DiscussionsListScreen() {
//   const { user } = useContext(AuthContext);
//   const navigation = useNavigation<any>();
  
//   const theme = useTheme();
//   const [discussions, setDiscussions] = useState<Discussion[]>([]);
//   const API_BASE = "http://localhost:3000";

//   const loadDiscussions = () => {
//     fetch(`${API_BASE}/discussions`)
//       .then((res) => res.json())
//       .then((data) => setDiscussions(data))
//       .catch((err) => console.error("Error fetching discussions:", err));
//   };

//   useEffect(() => {
//     loadDiscussions();
//   }, []);

//   const sendVote = async (id: number, direction: "up" | "down") => {
//     try {
//       if (!user) return alert("You must be logged in to vote");

//       const res = await fetch(`${API_BASE}/discussions/${id}/vote`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId: user.id, direction }),
//       });

//       if (!res.ok) return;

//       const updated = await res.json();

//       setDiscussions((prev) =>
//         prev.map((d) =>
//           d.id === updated.id ? { ...d, ...updated } : d
//         )
//       );
//     } catch (e) {
//       console.error("Vote error:", e);
//     }
//   };

//   const openDiscussion = (id: number) => {
//     navigation.navigate("DiscussionDetail", { id });
//   };


//   const renderItem = ({ item }: { item: Discussion }) => (
//     <View style={styles.sectionWrapper}>
//     <Card
//       mode="elevated"
//        style={[globalStyles.card, styles.discussionCard]}
//       onPress={() => openDiscussion(item.id)}
//     >
//       <Card.Content>
//         {/* TITLE */}
//         <Text
//           style={[
//             styles.title,
//             { color: theme.colors.onSurface, marginBottom: 6 }
//           ]}
//           numberOfLines={3}
//         >
//           {item.title}
//         </Text>
//         <Text numberOfLines={2} style={styles.content}>
//           {item.body}
//         </Text>

//         <Divider style={{ marginVertical: 12 }} />

//         <View style={styles.row}>
//           {/* Upvote */}
//           <View style={styles.voteGroup}>
//             <IconButton
//               icon="thumb-up"
//               size={20}
//               onPress={() => sendVote(item.id, "up")}
//             />
//             <Text style={styles.voteCount}>{item.upvotes}</Text>
//           </View>

//           {/* Downvote */}
//           <View style={styles.voteGroup}>
//             <IconButton
//               icon="thumb-down"
//               size={20}
//               onPress={() => sendVote(item.id, "down")}
//             />
//             <Text style={styles.voteCount}>{item.downvotes}</Text>
//           </View>

//           {/* Comments */}
//           <View style={styles.voteGroup}>
//             <IconButton icon="comment" size={20} />
//             <Text style={styles.voteCount}>{item.comment_count}</Text>
//           </View>
//         </View>
//       </Card.Content>
//     </Card>
//     </View>
//   );

//   return (
//     <View style={globalStyles.screen}>
//       <FlatList
//         data={discussions}
//         renderItem={renderItem}
//         keyExtractor={(i) => i.id.toString()}
//         contentContainerStyle={{ paddingBottom: 40 }}
//       />
//     </View>
//   );
// }

// // ------------------------------
// // Only LOCAL styles for this page
// // ------------------------------
// const styles = StyleSheet.create({
// discussionCard: {
//   backgroundColor: "rgba(255,255,255,0.04)",
//   borderRadius: 18,
//   borderColor: "#ffffff22",
//   borderWidth: 1,
//   shadowColor: "#000",
//   shadowOpacity: 0.25,
//   shadowRadius: 8,
//   shadowOffset: { width: 0, height: 4 },
// },
//   title: {
//     color: "#e0e0e0",
//     fontSize: 18,
//     fontWeight: "600",
//   },
//   content: {
//     color: "#c2c2c2",
//   },
//   row: {
//     flexDirection: "row",
//     marginTop: 10,
//     justifyContent: "space-evenly",
//     alignItems: "center",
//   },
//   voteGroup: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   voteCount: {
//     color: "#e0e0e0",
//     fontSize: 14,
//   },
//    sectionWrapper: {
//     width: "100%",
//     paddingHorizontal: 14,
//     marginBottom: 6,
//   },
//   gradientCard: {
//   borderRadius: 18,
//   overflow: "hidden",
// },
// headerGradient: {
//   height: 6,
//   backgroundColor: "rgba(78,163,255,0.3)",
// },
// });

// function alert(arg0: string) {
//   throw new Error("Function not implemented.");
// }
import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { globalStyles } from "../theme/globalStyles";

import {
  Text,
  Card,
  IconButton,
  Divider,
  useTheme
} from "react-native-paper";

type Discussion = {
  id: number;
  title: string;
  body: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
};

export default function DiscussionsListScreen() {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const navigation = useNavigation<any>();

  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const API_BASE = "http://localhost:3000";

  const loadDiscussions = () => {
    fetch(`${API_BASE}/discussions`)
      .then(res => res.json())
      .then(data => setDiscussions(data))
      .catch(err => console.error("Error fetching discussions:", err));
  };

  useEffect(() => {
    loadDiscussions();
  }, []);

  const sendVote = async (id: number, direction: "up" | "down") => {
    try {
      if (!user) return alert("You must be logged in to vote");

      const res = await fetch(`${API_BASE}/discussions/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, direction })
      });

      if (!res.ok) return;

      const updated = await res.json();

      setDiscussions(prev =>
        prev.map(d => (d.id === updated.id ? { ...d, ...updated } : d))
      );
    } catch (e) {
      console.error("Vote error:", e);
    }
  };

  const openDiscussion = (id: number) => {
    navigation.navigate("DiscussionDetail", { id });
  };


  const renderItem = ({ item }: { item: Discussion }) => (
    <View style={styles.sectionWrapper}>
      <Card
        mode="elevated"
        style={[styles.discussionCard]}
        onPress={() => openDiscussion(item.id)}
        theme={{ colors: { surface: theme.colors.surface } }}
      >
        {/* Gradient Bar */}
        <View style={styles.gradientBar} />

        <Card.Content style={{ paddingTop: 12 }}>
          
          {/* Small tag */}
          <View style={styles.tag}>
            <Text style={styles.tagText}>Trending</Text>
          </View>

          {/* TITLE */}
          <Text
            numberOfLines={3}
            style={[
              styles.title,
              { color: theme.colors.onSurface }
            ]}
          >
            {item.title}
          </Text>

          {/* PREVIEW */}
          <Text
            numberOfLines={2}
            style={[styles.content, { color: theme.colors.onSurfaceVariant }]}
          >
            {item.body}
          </Text>

          <Divider style={{ marginVertical: 14 }} />

          {/* Votes Row */}
          <View style={styles.row}>
            {/* Upvote */}
            <View style={styles.voteGroup}>
              <IconButton
                icon="thumb-up"
                size={20}
                onPress={() => sendVote(item.id, "up")}
                iconColor={theme.colors.primary}
              />
              <Text style={[styles.voteCount, { color: theme.colors.onSurface }]}>
                {item.upvotes}
              </Text>
            </View>

            {/* Downvote */}
            <View style={styles.voteGroup}>
              <IconButton
                icon="thumb-down"
                size={20}
                onPress={() => sendVote(item.id, "down")}
                iconColor={theme.colors.primary}
              />
              <Text style={[styles.voteCount, { color: theme.colors.onSurface }]}>
                {item.downvotes}
              </Text>
            </View>

            {/* Comments */}
            <View style={styles.voteGroup}>
              <IconButton
                icon="comment"
                size={20}
                iconColor={theme.colors.primary}
              />
              <Text style={[styles.voteCount, { color: theme.colors.onSurface }]}>
                {item.comment_count}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <View style={globalStyles.screen}>
      <Text
  variant="headlineMedium"
  style={{
    color: theme.colors.onBackground,
    textAlign: "center",
    marginBottom: 6,
    fontWeight: "700",
  }}
>
  Community Discussions
</Text>

<Text
  variant="bodyMedium"
  style={{
    color: theme.colors.onSurfaceVariant,
    textAlign: "center",
    marginBottom: 20,
  }}
>
  See what people are talking about today.
</Text>
      <FlatList
        data={discussions}
        renderItem={renderItem}
        keyExtractor={i => i.id.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionWrapper: {
    width: "100%",
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  discussionCard: {
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "#ffffff22",
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  gradientBar: {
    height: 6,
    width: "100%",
    backgroundColor: "rgba(78,163,255,0.35)",
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },

  content: {
    fontSize: 14,
    marginBottom: 4,
  },

  tag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(78,163,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },

  tagText: {
    color: "#A8CFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  voteGroup: {
    flexDirection: "row",
    alignItems: "center",
  },

  voteCount: {
    fontSize: 14,
    marginLeft: -4,
  },
});

function alert(msg: string) {
  console.error(msg);
}
