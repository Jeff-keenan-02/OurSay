import React, { useContext, useState, useCallback } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useTheme, Text } from "react-native-paper";

import { AuthContext } from "../../context/AuthContext";
import { Screen } from "../../layout/Screen";
import { BackRow } from "../../components/common/BackRow";
import { StickyCommentBar } from "../../components/Discussion/StickyCommentBar";
import { CommentCard } from "../../components/Discussion/CommentCard";
import { TierBadge } from "../../components/common/TierBadge";

import { useDiscussion } from "../../hooks/discussions/useDiscussion";
import { usePostComment } from "../../hooks/discussions/usePostComment";

import { permissions } from "../../utils/permissions";
import { typography } from "../../theme/typography";
import { VerificationTier } from "../../types/VerificationTier";


type RootStackParamList = {
  DiscussionDetail: { id: number };
};

export default function DiscussionDetailScreen() {
  const theme = useTheme();
  const navigation: any = useNavigation();
  const { user } = useContext(AuthContext);


  const route = useRoute<RouteProp<RootStackParamList, "DiscussionDetail">>();
  const { id } = route.params;

  /* -------------------------------------------------
     Queries
  --------------------------------------------------*/

  const discussionQuery = useDiscussion(id);

  /* -------------------------------------------------
     Mutations
  --------------------------------------------------*/

  const commentMutation = usePostComment(id);

  /* -------------------------------------------------
     Local State
  --------------------------------------------------*/

  const [newComment, setNewComment] = useState("");

  /* -------------------------------------------------
     Derived Values
  --------------------------------------------------*/

  const userTier: VerificationTier =
    user?.verification_tier ?? 0;

  const canComment = permissions.canComment(userTier);

  /* -------------------------------------------------
     Handlers
  --------------------------------------------------*/

  const handleSubmitComment = useCallback(async () => {
    if (!user) return;
    if (!canComment) return;
    if (!newComment.trim()) return;

    const result = await commentMutation.postComment(
      newComment,
      user.id
    );

    if (result) {
      setNewComment("");
      discussionQuery.reload();
    }
  }, [
    user,
    canComment,
    newComment,
    commentMutation,
    discussionQuery,
  ]);

  const goToVerification = () => {
    navigation.navigate("Tabs", { screen: "Verify" });
  };

  /* -------------------------------------------------
     Loading State
  --------------------------------------------------*/

  if (discussionQuery.loading || !discussionQuery.data) {
    return (
      <Screen center>
        <Text variant={typography.body}>Loading…</Text>
      </Screen>
    );
  }

  const discussion = discussionQuery.data;

  /* -------------------------------------------------
     Render
  --------------------------------------------------*/

  return (
    <>
      <BackRow />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
        }}
      >
        <FlatList
          data={discussion.comments}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 140 }}
          ListHeaderComponent={
            <View
              style={[
                styles.headerCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.outlineVariant,
                },
              ]}
            >
            {/* --------------- title  ------------ */}
              <Text
                variant={typography.sectionTitle}
                style={{ color: theme.colors.onSurface }}
              >
                {discussion.title}
              </Text>

            {/* --------------- Created by and tier  ------------ */}
              <View style={styles.creatorRow}>
                <Text
                  style={[
                    styles.creatorText,
                    { color: theme.colors.primary },
                  ]}
                >
                  Created by {discussion.created_by}
                </Text>

                <TierBadge
                  tier={discussion.verification_tier}
                  onPress={goToVerification}
                />
              </View>

            {/* --------------- body  ------------ */}
              <Text
                variant={typography.body}
                style={[
                  styles.bodyText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {discussion.body}
              </Text>
            </View>
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

      {/* --------------- Comment bar  ------------ */}
      <StickyCommentBar
        value={newComment}
        onChange={setNewComment}
        onSubmit={handleSubmitComment}
        disabled={!canComment || commentMutation.loading}
        placeholder={
          canComment
            ? "Write a comment…"
            : "Verify your account to comment"
        }
      />
    </>
  );
}

/* =====================================================
   Styles
===================================================== */

const styles = {
  headerCard: {
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
  },

  creatorRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: 6,
    gap: 8,
  },

  creatorText: {
    fontWeight: "600" as const,
  },

  bodyText: {
    marginTop: 12,
    lineHeight: 22,
  },
};