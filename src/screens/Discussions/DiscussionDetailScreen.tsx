import React, { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useTheme, Text, Card, TextInput, Button, Divider } from "react-native-paper";

import { AuthContext } from "../../context/AuthContext";
import { globalStyles } from "../../theme/globalStyles";
import { useDiscussion } from "../../hooks/useDiscussion";
import { usePostComment } from "../../hooks/usePostComment";
import { timeAgo } from "../../utils/timeAgo";

type RootStackParamList = {
  DiscussionDetail: { id: number };
};


export default function DiscussionDetailScreen() {
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  const route = useRoute<RouteProp<RootStackParamList, "DiscussionDetail">>();
  const { id } = route.params;

  const API = "http://localhost:3000";

  // 🔥 NEW HOOK → handles loading the discussion + refreshing on focus
  const { discussion, loading, loadDiscussion } = useDiscussion(API, id);
   const { postComment } = usePostComment(API, id, () => {
      setNewComment("");
      loadDiscussion(); // Auto-refresh after comment
    });

  const [newComment, setNewComment] = useState("");

const submitComment = () => {
  if (!user) {
    Alert.alert("You must be logged in to comment.");
    return;
  }

  postComment(newComment, user.id);
};

  if (loading || !discussion) {
    return (
      <View style={globalStyles.screen}>
        <Text style={{ color: theme.colors.onBackground }}>Loading…</Text>
      </View>
    );
  }

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[globalStyles.screen, { backgroundColor: theme.colors.background }]}
      >
        <FlatList
          data={discussion.comments}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListHeaderComponent={
            <View>
              {/* --- Post Header --- */}
              <View style={styles.headerWrapper}>
                <Text
                  style={[styles.title, { color: theme.colors.onBackground }]}
                >
                  {discussion.title}
                </Text>
                <Text
                  style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}
                >
                  Posted by {discussion.username ?? "Anonymous"} •{" "}
                  {timeAgo(discussion.created_at)}
                </Text>
              </View>

              {/* --- Body Card --- */}
              <Card
                mode="elevated"
                style={[
                  styles.bodyCard,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <Card.Content>
                  <Text
                    style={[styles.bodyText, { color: theme.colors.onSurface }]}
                  >
                    {discussion.body}
                  </Text>
                </Card.Content>
              </Card>

              {/* --- Comments Header --- */}
              <Divider />
              <Text
                style={[
                  styles.commentsHeader,
                  { color: theme.colors.onBackground },
                ]}
              >
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
                },
              ]}
            >
              <View style={styles.commentHeader}>
                <Text
                  style={[styles.commentAuthor, { color: theme.colors.primary }]}
                >
                  {item.username ?? "Anonymous"}
                </Text>
                <Text
                  style={[styles.commentTime, { color: theme.colors.onSurfaceVariant }]}
                >
                  {timeAgo(item.created_at)}
                </Text>
              </View>

              <Text
                style={[styles.commentText, { color: theme.colors.onSurface }]}
              >
                {item.body}
              </Text>
            </View>
          )}
        />
      </KeyboardAvoidingView>

      {/* --- Input bar --- */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
          },
        ]}
      >
        <TextInput
          mode="flat"
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Write a comment…"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          style={[
            styles.input,
            { backgroundColor: theme.colors.background },
          ]}
        />

        <Button mode="contained" onPress={submitComment} style={styles.postButton}>
          Post
        </Button>
      </View>
    </>
  );
}

// --- STYLES (exactly your current UI, untouched) ---
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
  commentBlock: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    elevation: 10,
  },
  input: {
    flex: 1,
    borderRadius: 8,
    marginRight: 8,
    minHeight: 45,
    paddingHorizontal: 10,
  },
  postButton: {
    height: 45,
    justifyContent: "center",
    borderRadius: 8,
  },
});