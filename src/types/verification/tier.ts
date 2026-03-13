export type VerificationTier = 0 | 1 | 2 | 3;

export type TierInfo = {
  label: string;
  description: string;
  icon: string;
  color: string;
  next: string | null;
  permissions: string[];
};


export const VERIFICATION_TIERS: Record<VerificationTier, TierInfo> = {
  0: {
    label: "Unverified",
    description: "Read-only access",
    icon: "shield-outline",
    color: "#9e9e9e",
    next: "Complete liveness check",
    permissions: [
      "View discussions",
      "View petitions"
    ],
  },

  1: {
    label: "Tier 1 ",
    description: "Human presence confirmed",
    icon: "shield-outline",
    color: "#cd7f32",
    next: "Verify passport",
    permissions: [
      "Comment on discussions"
    ],
  },

  2: {
    label: "Tier 2 Verified",
    description: "Identity verified",
    icon: "shield-outline",
    color: "#c0c0c0",
    next: "Confirm residence",
    permissions: [
      "Comment on discussions",
      "Vote on polls",
      "Vote on petitions"
    ],
  },

  3: {
    label: "Tier 3 Verified",
    description: "Fully verified citizen",
    icon: "shield-outline",
    color: "#ffd700",
    next: null,
    permissions: [
      "Comment on discussions",
      "Vote on polls",
      "Vote on petitions",
      "Create polls and petitions",
    ],
  },
};