export type VerificationTier = 0 | 1 | 2 | 3;

export type TierInfo = {
  label: string;
  description: string;
  icon: string;
  color: string;
  next: string | null;
};


export const VERIFICATION_TIERS: Record<VerificationTier, TierInfo> = {
  0: {
    label: "Unverified",
    description: "No verification completed",
    icon: "shield-outline",
    color: "#9e9e9e", // neutral grey
    next: "Complete liveness check",
  },

  1: {
    label: "Bronze verified",
    description: "Human presence confirmed",
    icon: "shield-outline",
    color: "#cd7f32", // bronze
    next: "Verify passport",
  },

  2: {
    label: "Silver verified",
    description: "Identity verified",
    icon: "shield-outline",
    color: "#c0c0c0", // silver
    next: "Confirm residence",
  },

  3: {
    label: "Gold verified",
    description: "Fully verified citizen",
    icon: "shield-outline",
    color: "#ffd700", // gold
    next: null,
  },
};