export type WeeklyCardData = {
  label: string;
  title: string;
  description?: string;

  progress?: number;       // For polls
  footerText?: string;     // "12 comments", "230 signatures"

  createdBy?: string;      // For discussions & petitions
};