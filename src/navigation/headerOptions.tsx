// src/navigation/headerOptions.ts
import { TierBadge } from "../components/Verification/TierBadge";
import { VerificationTier } from "../types/VerificationTier";

type Params = {
  tier: VerificationTier;
  onPress: () => void;
};

export function tierHeaderRight({ tier, onPress }: Params) {
  return {
    headerRight: () => (
      <TierBadge
        tier={tier}
        onPress={onPress}
      />
    ),
  };
}