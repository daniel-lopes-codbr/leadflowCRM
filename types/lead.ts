export const LEAD_STATUSES = [
  "Novo Lead",
  "Contato Realizado",
  "Proposta Enviada",
  "Negociação",
  "Fechado Ganho",
  "Fechado Perdido",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  status: LeadStatus;
  ownerId: string;
  ownerName: string;
  createdAt: string;
}
