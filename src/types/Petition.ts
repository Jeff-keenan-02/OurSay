// src/types/Petition.ts

import { VerificationTier } from "./verification";


export type Petition = {
  id: number;
  title: string;
  description: string;
  signature_goal: number;
  signatures: number;
  progress: number;
  has_signed: boolean; 
  required_verification_tier: VerificationTier;
};