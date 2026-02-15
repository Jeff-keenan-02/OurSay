// src/types/Discussion.ts

import { Comment } from "./Comment";
import { VerificationTier } from "./VerificationTier";

/* =====================================================
   Core Base (Single Source of Truth)
===================================================== */

export type DiscussionBase = {
  id: number;
  title: string;
  body: string;
  created_at: string;
  created_by: string;
  verification_tier: VerificationTier;
};

/* =====================================================
   Metrics
===================================================== */

export type DiscussionMetrics = {
  upvotes: number;
  downvotes: number;
  comment_count: number;
};

/* =====================================================
   List View (Trending, By Topic)
===================================================== */

export type DiscussionListItem =
  DiscussionBase & DiscussionMetrics;

/* =====================================================
   Weekly Discussion
   (Is just a lighter list item)
===================================================== */

export type WeeklyDiscussion =
  DiscussionBase & {
    comment_count: number;
  };

/* =====================================================
   Detail View
===================================================== */

export type DiscussionDetail =
  DiscussionBase & {
    comments: Comment[];
  };