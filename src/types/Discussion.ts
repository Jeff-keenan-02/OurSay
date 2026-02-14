// src/types/Discussion.ts
import { Comment } from "./Comment";
import { VerificationTier } from "./VerificationTier";

/**
 * Used for the featured weekly discussion card.
 * Matches GET /discussions/weekly.
 */
export type WeeklyDiscussion = {
  id: number;
  title: string;
  body: string;
  comment_count: number;
  created_at: string;
  created_by: string;  
};

/**
 * Core discussion entity fields.
 */
export type DiscussionBase = {
  id: number;
  title: string;
  body: string;
  created_at: string;
  created_by: string;
  verification_tier: VerificationTier;
};

/**
 * Engagement metrics added for list views (trending, by topic).
 */
export type DiscussionMetrics = {
  upvotes: number;
  downvotes: number;
  comment_count: number;
};

/**
 * Discussion shown in lists/cards.
 */
export type DiscussionListItem =
  DiscussionBase & DiscussionMetrics;

/**
 * Full discussion page with comments.
 */
export type DiscussionDetail =
  DiscussionBase & {
    comments: Comment[];
  };