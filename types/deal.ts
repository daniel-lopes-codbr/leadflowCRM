import type { Activity } from "@/types/activity";
import type { LeadStatus } from "@/types/lead";

export interface Deal {
  id: string;
  title: string;
  value: number;
  leadId: string;
  leadName: string;
  leadPhone: string;
  hasOverdueFollowUp: boolean;
  // Só populado no Pipeline (onde o modal de edição do negócio precisa
  // listar/gerenciar follow-ups do lead) — em outros contextos (ex.:
  // Dashboard) fica undefined.
  followUps?: Activity[];
  ownerId: string;
  ownerName: string;
  deadline: string;
  status: LeadStatus;
}
