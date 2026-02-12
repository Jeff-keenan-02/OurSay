import { VerificationTier } from "./VerificationTier";

export type Comment = {
  id: number;
  body: string;
  created_at: string;
  username: string | null;
  verification_tier: VerificationTier;
};