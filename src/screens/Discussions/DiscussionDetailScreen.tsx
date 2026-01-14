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
import { globalStyles } from "../../styles/globalStyles";
import { useDiscussion } from "../../hooks/discussions/useDiscussion";
import { usePostComment } from "../../hooks/comments/usePostComment";
import { StickyCommentBar } from "../../components/Discussion/StickyCommentBar";
import { CommentCard } from "../../components/Discussion/CommentCard";
import { DiscussionHeader } from "../../components/Discussion/DiscussionHeader";

type RootStackParamList = {
  DiscussionDetail: { id: number };
};


export default function DiscussionDetailScreen() {
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  const route = useRoute<RouteProp<RootStackParamList, "DiscussionDetail">>();
  const { id } = route.params;

  const API = "http://localhost:3000";

  //HOOK → handles loading the discussion + refreshing on focus
  const { discussion, loading, loadDiscussion } = useDiscussion(API, id);
  
  // Auto-refresh after comment
  const { postComment } = usePostComment(API, id, () => { setNewComment(""); loadDiscussion(); });

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
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <FlatList
          data={discussion.comments}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 140 }}
          ListHeaderComponent={
            <DiscussionHeader
              title={discussion.title}
              body={discussion.body}
              username={discussion.username}
              created_at={discussion.created_at}
            />
          }
          renderItem={({ item }) => (
            <CommentCard
              username={item.username}
              body={item.body}
              created_at={item.created_at}
            />
          )}
        />
      </KeyboardAvoidingView>

      <StickyCommentBar
        value={newComment}
        onChange={setNewComment}
        onSubmit={submitComment}
      />
    </>
  );
}