export const ACTIVITY_TYPES = ["Ligação", "E-mail", "Reunião", "Nota"] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface Activity {
  id: string;
  leadId: string;
  type: ActivityType;
  description: string;
  authorName: string;
  occurredAt: string;
}
