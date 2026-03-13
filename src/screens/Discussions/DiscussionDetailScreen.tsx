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
import { permissions } from "../../utils/permissions";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { VerificationTier } from "../../types/verification";
import { SectionError, SectionLoader } from "../../components/common/SectionState";
import { Keyboard } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackRow } from "../../components/common/BackRow";



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

  const userTier: VerificationTier =user?.verification_tier ?? 0;

  const canComment = permissions.canComment(userTier);

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();



  /* -------------------------------------------------
     Handlers
  --------------------------------------------------*/

  const handleSubmitComment = useCallback(async () => {
    if (!user) return;
    if (!canComment) return;
    if (!newComment.trim()) return;

    const success = await commentMutation.postComment(
      newComment,
    );

    if (success) {
      setNewComment("");
      discussionQuery.reload();
      Keyboard.dismiss();
    }
  }, [
    user,
    canComment,
    newComment,
    commentMutation,
    discussionQuery,
  ]);


 // ✅ NOW SAFE to early return
  if (discussionQuery.loading) return <SectionLoader />;
  if (discussionQuery.error) return <SectionError message={discussionQuery.error} />;
  if (!discussionQuery.data) return null;

  const discussion = discussionQuery.data;
  
  /* -------------------------------------------------
     Render
  --------------------------------------------------*/

return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>

    <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
      <BackRow />
    </View>
    
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={headerHeight}
        >

          {/* Main Column Layout */}
          <View style={{ flex: 1 }}>

            {/* COMMENTS LIST */}
            <FlatList
              style={{ flex: 1 }}
              data={discussionQuery.data.comments}
              keyExtractor={(item) => item.id.toString()}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 0 }}

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
                    {discussionQuery.data.title}
                  </Text>

                  <View style={styles.creatorRow}>
                    <Text
                      style={{
                        color: theme.colors.primary,
                        fontWeight: "600",
                      }}
                    >
                      Created by {discussionQuery.data.created_by}
                    </Text>

                    <TierBadge
                      tier={discussionQuery.data.verification_tier}
                      onPress={() =>
                        navigation.navigate("Tabs", {
                          screen: "Verify",
                        })
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
                    {discussionQuery.data.body}
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
        </KeyboardAvoidingView>
      </View>
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