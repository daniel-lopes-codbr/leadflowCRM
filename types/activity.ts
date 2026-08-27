export const ACTIVITY_TYPES = ["Ligação", "E-mail", "Reunião", "Nota", "Responsável"] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface Activity {
  id: string;
  leadId: string;
  type: ActivityType;
  description: string;
  authorName: string;
  occurredAt: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  canceledAt: string | null;
}

export type FollowUpStatus = "log" | "pending" | "overdue" | "completed" | "canceled";

// "log" cobre tanto atividades comuns (Nota/Ligação/etc, sem scheduledAt)
// quanto follow-ups já concluídos/cancelados — em ambos os casos é só
// histórico, sem ação pendente pro usuário.
export function getFollowUpStatus(activity: Activity): FollowUpStatus {
  if (!activity.scheduledAt) return "log";
  if (activity.completedAt) return "completed";
  if (activity.canceledAt) return "canceled";

  return new Date(activity.scheduledAt) < new Date() ? "overdue" : "pending";
}
