export type Poll = {
  id: number;
  question: string;
  description?: string | null;
  required_verification_tier: number;
};