import React, { useContext, useState, useCallback, useMemo } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useTheme, Text, Divider } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from "../../context/AuthContext";
import { useDiscussion } from "../../hooks/discussions/useDiscussion";
import { usePostComment } from "../../hooks/discussions/usePostComment";
import { useApiClient } from "../../hooks/common/useApiClient";
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
  const [tierFilter, setTierFilter] = useState<0 | 1 | 2 | 3>(0);

  const TIER_FILTERS: { key: 0 | 1 | 2 | 3; label: string }[] = [
    { key: 0, label: "All" },
    { key: 1, label: "Tier 1" },
    { key: 2, label: "Tier 2" },
    { key: 3, label: "Tier 3" },
  ];

  const filteredComments = useMemo(() => {
    const comments = discussionQuery.data?.comments ?? [];
    return tierFilter === 0 ? comments : comments.filter((c) => c.verification_tier === tierFilter);
  }, [discussionQuery.data?.comments, tierFilter]);
  const api = useApiClient();
  const [myVote, setMyVote] = useState<"up" | "down" | null>(null);

  const handleVote = async (direction: "up" | "down") => {
    if (myVote === direction) return;
    setMyVote(direction);
    try {
      await api.post(`/discussions/${id}/vote`, { direction });
      discussionQuery.reload();
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };


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
              data={filteredComments}
              keyExtractor={(item) => item.id.toString()}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 0 }}

              ListHeaderComponent={
                <>
                  <View style={[styles.headerCard, { backgroundColor: theme.colors.surface }]}>
                    {/* Title */}
                    <Text variant={typography.sectionTitle} style={{ color: theme.colors.onSurface }}>
                      {discussion.title}
                    </Text>

                    {/* Author + tier row */}
                    <View style={styles.creatorRow}>
                      <View style={styles.authorPill}>
                        <MaterialCommunityIcons name="account-circle-outline" size={14} color={theme.colors.primary} />
                        <Text style={[styles.createdByLabel, { color: theme.colors.primary }]}>
                          Created by{" "}
                          <Text style={[styles.createdByName, { color: theme.colors.primary }]}>
                            {discussion.created_by}
                          </Text>
                        </Text>
                      </View>
                      <TierBadge tier={discussion.verification_tier} />
                    </View>

                    {/* Body */}
                    <Text variant={typography.body} style={[styles.bodyText, { color: theme.colors.onSurfaceVariant }]}>
                      {discussion.body}
                    </Text>

                    <Divider style={{ marginTop: spacing.md }} />

                    {/* Vote row */}
                    <View style={styles.voteRow}>
                      <TouchableOpacity
                        style={[styles.voteBtn, myVote === "up" && { backgroundColor: theme.colors.primary + "20", borderColor: theme.colors.primary + "60" }]}
                        onPress={() => handleVote("up")}
                      >
                        <MaterialCommunityIcons
                          name={myVote === "up" ? "thumb-up" : "thumb-up-outline"}
                          size={18}
                          color={theme.colors.primary}
                        />
                        <Text style={[styles.voteCount, { color: theme.colors.primary }]}>
                          {(discussion as any).upvotes ?? 0}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.voteBtn, myVote === "down" && { backgroundColor: "#f87171" + "20", borderColor: "#f87171" + "60" }]}
                        onPress={() => handleVote("down")}
                      >
                        <MaterialCommunityIcons
                          name={myVote === "down" ? "thumb-down" : "thumb-down-outline"}
                          size={18}
                          color={myVote === "down" ? "#f87171" : theme.colors.primary}
                        />
                        <Text style={[styles.voteCount, { color: myVote === "down" ? "#f87171" : theme.colors.primary }]}>
                          {(discussion as any).downvotes ?? 0}
                        </Text>
                      </TouchableOpacity>

                      <Text style={[styles.postDate, { color: theme.colors.onSurfaceVariant }]}>
                        {new Date(discussion.created_at).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })}
                      </Text>
                    </View>
                  </View>

                  {/* Comments section header + tier filter */}
                  <View style={styles.commentsSectionHeader}>
                    <MaterialCommunityIcons name="comment-multiple-outline" size={16} color={theme.colors.primary} />
                    <Text style={[styles.commentsSectionTitle, { color: theme.colors.primary }]}>
                      Comments
                    </Text>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tierChipRow}>
                    {TIER_FILTERS.map((f) => {
                      const active = tierFilter === f.key;
                      return (
                        <TouchableOpacity
                          key={f.key}
                          onPress={() => setTierFilter(f.key)}
                          style={[styles.tierChip, { backgroundColor: active ? theme.colors.primary : theme.colors.surface }]}
                        >
                          <Text style={[styles.tierChipText, { color: active ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }]}>
                            {f.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
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

              ListEmptyComponent={
                <View style={[styles.emptyBox, { backgroundColor: theme.colors.surface }]}>
                  <MaterialCommunityIcons name="comment-off-outline" size={28} color={theme.colors.onSurfaceVariant} />
                  <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                    {tierFilter === 0
                      ? "No comments yet"
                      : `No Tier ${tierFilter} comments on this discussion`}
                  </Text>
                </View>
              }
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

const styles = StyleSheet.create({
  headerCard: {
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 12,
  },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 4,
  },
  authorPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
  },
  createdByLabel: {
    fontSize: 13,
  },
  createdByName: {
    fontWeight: "700",
    fontSize: 13,
  },
  bodyText: {
    marginTop: 12,
    lineHeight: 22,
  },
  voteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  voteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  voteCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  commentsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  commentsSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  postDate: {
    fontSize: 12,
    marginLeft: "auto",
    opacity: 0.5,
  },
  tierChipRow: {
    flexGrow: 0,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  tierChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
  },
  tierChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyBox: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 24,
    borderRadius: 14,
    alignItems: "center",
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.6,
  },
  content: {
    flex: 1,
    gap: spacing.lg,
  },
});