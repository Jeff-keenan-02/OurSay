// The ONLY valid verification states in the system
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
    label: "Tier 0 — Unverified",
    description: "No verification completed",
    icon: "shield-outline",
    color: "#9e9e9e",
    next: "Complete liveness check",
  },
  1: {
    label: "Tier 1 — Liveness verified",
    description: "Human presence confirmed",
    icon: "account-check",
    color: "#2196f3",
    next: "Verify passport",
  },
  2: {
    label: "Tier 2 — Identity verified",
    description: "Passport successfully verified",
    icon: "passport",
    color: "#4caf50",
    next: "Confirm residence",
  },
  3: {
    label: "Tier 3 — Residence verified",
    description: "High confidence Irish residency",
    icon: "home-check",
    color: "#2e7d32",
    next: null,
  },
};