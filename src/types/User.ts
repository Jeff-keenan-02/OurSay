import { VerificationTier } from "./verification";


export type User = {
  id: number;
  username: string;
  verification_tier: VerificationTier;
};