export type WeeklyCardData =
  | {
      type: "discussion";
      label?: string;
      id: number;
      title: string;
      description: string;
      createdBy: string;
      footerText: string; // "12 comments"
    }
  | {
      type: "poll";
      label?: string;
      id: number;
      title: string;
      progress: number;
      footerText: string; // "2/5 completed"
      respondent_count: number;
      required_verification_tier?: number;
    }
  | {
      type: "petition";
      label?: string;
      id: number;
      title: string;
      description: string;
      progress: number;
      signatures: number;
      signature_goal: number;
      has_signed?: boolean;
      required_verification_tier?: number;
    };