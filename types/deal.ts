import type { LeadStatus } from "@/types/lead";

export interface Deal {
  id: string;
  title: string;
  value: number;
  leadId: string;
  leadName: string;
  leadPhone: string;
  hasOverdueFollowUp: boolean;
  ownerId: string;
  ownerName: string;
  deadline: string;
  status: LeadStatus;
}
