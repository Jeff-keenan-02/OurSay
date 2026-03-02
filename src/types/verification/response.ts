import { VerificationType } from "./type";
import { VerificationTier } from "./tier";

export type VerificationResponse = {
  success: boolean;
  type: VerificationType;
  level: VerificationTier;
  mock?: boolean;
};