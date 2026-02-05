// src/utils/permissions.ts
import { VerificationTier } from "../types/VerificationTier";

export const permissions = {
  canComment(userTier: VerificationTier): boolean {
    return userTier >= 1;
  },

  canSignPetition(
    userTier: VerificationTier,
    requiredTier: VerificationTier
  ): boolean {
    return userTier >= requiredTier;
  },

  canVotePoll(
    userTier: VerificationTier,
    requiredTier: VerificationTier
  ): boolean {
    return userTier >= requiredTier;
  },

  canCreateContent(userTier: VerificationTier): boolean {
    return userTier === 3;
  },
};