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
import { usePostComment } from "../../hooks/comments/usePostComment";
import { StickyCommentBar } from "../../components/Discussion/StickyCommentBar";
import { CommentCard } from "../../components/Discussion/CommentCard";
import { DiscussionHeader } from "../../components/Discussion/DiscussionHeader";
import { typography } from "../../theme/typography";
import { Screen } from "../../layout/Screen";
import { permissions } from "../../utils/permissions";
import { VerificationTier } from "../../types/VerificationTier";

type RootStackParamList = {
  DiscussionDetail: { id: number };
};


export default function DiscussionDetailScreen() {
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  const route = useRoute<RouteProp<RootStackParamList, "DiscussionDetail">>();
  const { id } = route.params;



  const userTier: VerificationTier = user?.verification_level ?? 0;
  const canComment = permissions.canComment(userTier);

  //HOOK → handles loading the discussion + refreshing on focus
  const { discussion, loading, loadDiscussion } = useDiscussion(id);
  
  // Auto-refresh after comment
  const { postComment } = usePostComment(id, () => { setNewComment(""); loadDiscussion(); });

  const [newComment, setNewComment] = useState("");

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
              created_at={discussion.created_at}
            />
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