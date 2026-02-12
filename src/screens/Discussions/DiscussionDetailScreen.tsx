import React, { useContext, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useTheme, Text} from "react-native-paper";
import { AuthContext } from "../../context/AuthContext";
import { useDiscussion } from "../../hooks/discussions/useDiscussion";
import { StickyCommentBar } from "../../components/Discussion/StickyCommentBar";
import { CommentCard } from "../../components/Discussion/CommentCard";
import { typography } from "../../theme/typography";
import { Screen } from "../../layout/Screen";
import { permissions } from "../../utils/permissions";
import { VerificationTier } from "../../types/VerificationTier";
import { BackRow } from "../../components/common/BackRow";
import { usePostComment } from "../../hooks/discussions/usePostComment";

type RootStackParamList = {
  DiscussionDetail: { id: number };
};



export default function DiscussionDetailScreen() {
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  const route = useRoute<RouteProp<RootStackParamList, "DiscussionDetail">>();
  const { id } = route.params;



  const userTier: VerificationTier = user?.verification_tier ?? 0;
  const canComment = permissions.canComment(userTier);

  //HOOK → handles loading the discussion + refreshing on focus
  const { discussion, loading, loadDiscussion } = useDiscussion(id);
  
  // Auto-refresh after comment
  const { postComment } = usePostComment(id, () => { setNewComment(""); loadDiscussion(); });

  const [newComment, setNewComment] = useState("");

  console.log("Loaded discussion:", discussion);
  
  const submitComment = () => {
    if (!user) {
    return;
    }

    if (!canComment) {
      return;
    }

    if (!newComment.trim()) {
      return;
    }
  
    postComment(newComment, user.id);
};

  if (loading || !discussion) {
    return (
      <Screen center>
        <Text variant={typography.body}>
          Loading…
        </Text>
      </Screen>
    );
  }

   return (
    <>
    <BackRow/>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <FlatList
  data={discussion.comments}
  keyExtractor={(item) => item.id.toString()}
  contentContainerStyle={{ paddingBottom: 140 }}
  
  ListHeaderComponent={
    <>
      <Text
        variant={typography.sectionTitle}
        style={{
          marginBottom: 8,
          color: theme.colors.onSurface,
        }}
      >
        {discussion.title}
      </Text>

      <Text
        variant={typography.body}
        style={{
          marginBottom: 20,
          color: theme.colors.onSurfaceVariant,
        }}
      >
        {discussion.body}
      </Text>
    </>
  }

  renderItem={({ item }) => (
    <CommentCard
      username={item.username}
      body={item.body}
      verificationTier={item.verification_tier}
      created_at={item.created_at}
    />
  )}
/>
      </KeyboardAvoidingView>

      <StickyCommentBar
        value={newComment}
        onChange={setNewComment}
        onSubmit={submitComment}
        disabled={!canComment}
        placeholder={
          canComment
            ? "Write a comment…"
            : "Verify your account to comment"
        }
      />
    </>
  );
}