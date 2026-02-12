// src/types/Petition.ts
import { VerificationTier } from "./VerificationTier";

export type Petition = {
  id: number;
  title: string;
  description: string;
  signatures: number;
  required_verification_tier: VerificationTier;
};