// src/utils/permissions.ts

import { VerificationTier } from "../types/verification";


export const permissions = {
  canStartLiveness(userTier: VerificationTier) {
    return userTier === 0;
  },

  canStartPassport(userTier: VerificationTier) {
    return userTier >= 1 && userTier < 2;
  },

  canStartResidence(userTier: VerificationTier) {
    return userTier >= 2 && userTier < 3;
  },

  // existing rules...
  canComment(userTier: VerificationTier) {
    return userTier >= 1;
  },

  canVotePoll(userTier: VerificationTier, requiredTier: VerificationTier) {
    return userTier >= requiredTier;
  },

  canSignPetition(userTier: VerificationTier, requiredTier: VerificationTier) {
    return userTier >= requiredTier;
  },

  canCreateContent(userTier: VerificationTier) {
    return userTier === 3;
  },
};