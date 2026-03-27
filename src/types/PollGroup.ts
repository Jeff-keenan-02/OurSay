import { VerificationTier } from "./verification";


export type PollGroup = {
  id: number;
  title: string;

  required_verification_tier: VerificationTier;

  total_polls: number;
  completed_polls: number;
  respondent_count: number;

  progress: number; // 0 → 1
  status: 0 | 1 | 2; // 0 not started, 1 in progress, 2 completed
};