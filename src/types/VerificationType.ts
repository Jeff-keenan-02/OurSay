import { VerificationTier } from "./VerificationTier";

export type VerificationType = "liveness" | "passport" | "residence";

export type VerificationResponse = {
  success: boolean;
  type: VerificationType;
  level: VerificationTier;
};