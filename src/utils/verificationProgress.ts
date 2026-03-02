import { VerificationTier } from "../types/verification";
import { VerificationProgressStatus } from "../types/verification/status";

/**
 * Resolves the UI progression state for a verification step.
 *
 * @param userTier Current user verification tier
 * @param stepTier Tier that this step grants
 */
export function resolveVerificationStatus(
  userTier: VerificationTier,
  stepTier: VerificationTier
): VerificationProgressStatus {

  if (userTier > stepTier) {
    return "completed";
  }

  if (userTier === stepTier) {
    return "available";
  }

  return "locked";
}