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
import { useDiscussion } from "../../hooks/discussions/useDiscussion";
import { usePostComment } from "../../hooks/discussions/usePostComment";

import { StickyCommentBar } from "../../components/Discussion/StickyCommentBar";
import { CommentCard } from "../../components/Discussion/CommentCard";
import { TierBadge } from "../../components/common/TierBadge";
import { QuerySection } from "../../components/common/QuerySection";
import { Screen } from "../../layout/Screen";

import { permissions } from "../../utils/permissions";
import { typography } from "../../theme/typography";
import { VerificationTier } from "../../types/VerificationTier";
import { spacing } from "../../theme/spacing";

type RootStackParamList = {
  DiscussionDetail: { id: number };
};

export default function DiscussionDetailScreen() {
  const theme = useTheme();
  const navigation: any = useNavigation();
  const { user } = useContext(AuthContext);

  const route =
    useRoute<RouteProp<RootStackParamList, "DiscussionDetail">>();
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

    const success = await commentMutation.postComment(
      newComment,
      user.id
    );

    if (success) {
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



  /* -------------------------------------------------
     Render
  --------------------------------------------------*/

 return (
  <Screen showBack scroll>

    <QuerySection 
    label = "" query={discussionQuery}>
      {(discussion) => (

        <View style={{ flex: 1 }}>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <FlatList
              style={{ flex: 1 }}
              data={discussion.comments}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 120 }}
              
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
                  <Text
                    variant={typography.sectionTitle}
                    style={{ color: theme.colors.onSurface }}
                  >
                    {discussion.title}
                  </Text>

                  <View style={styles.creatorRow}>
                    <Text
                      style={{
                        color: theme.colors.primary,
                        fontWeight: "600",
                      }}
                    >
                      Created by {discussion.created_by}
                    </Text>

                    <TierBadge
                      tier={discussion.verification_tier}
                      onPress={() =>
                        navigation.navigate("Tabs", { screen: "Verify" })
                      }
                    />
                  </View>

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

          {/* Sticky Comment Bar */}
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

        </View>

      )}
    </QuerySection>

  </Screen>
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
  content: {
  flex: 1,
  gap: spacing.lg,
},

  bodyText: {
    marginTop: 12,
    lineHeight: 22,
  }
};