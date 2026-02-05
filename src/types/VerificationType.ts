import { VerificationTier } from "./VerificationTier";

export type VerificationType = "liveness" | "passport" | "residence";

export type VerificationResponse = {
  verified: boolean;
  type: VerificationType;
  level: VerificationTier;
};