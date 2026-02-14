// src/types/Petition.ts
import { VerificationTier } from "./VerificationTier";

export type Petition = {
  id: number;
  title: string;
  description: string;
  signature_goal: number;
  signatures: number;
  progress: number;
  required_verification_tier: VerificationTier;
};