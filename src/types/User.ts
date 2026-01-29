import { VerificationTier } from "./VerificationTier";

export type User = {
  id: number;
  username: string;
  verification_level: VerificationTier;
};