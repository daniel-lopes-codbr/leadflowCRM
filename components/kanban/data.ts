import { mockLeads } from "@/components/leads/data";
import type { Deal } from "@/types/deal";

function lead(id: string) {
  const found = mockLeads.find((l) => l.id === id)!;
  return { leadId: found.id, leadName: found.name };
}

export const mockDeals: Deal[] = [
  {
    id: "d1",
    title: "Onboarding Lumen",
    value: 4800,
    ...lead("l4"),
    ownerId: "u1",
    ownerName: "Ana Martins",
    deadline: "2026-09-10",
    status: "Novo Lead",
  },
  {
    id: "d2",
    title: "Expansão Vetor",
    value: 9600,
    ...lead("l5"),
    ownerId: "u2",
    ownerName: "João Pedro",
    deadline: "2026-08-19",
    status: "Contato Realizado",
  },
  {
    id: "d3",
    title: "Implantação Nortis",
    value: 42000,
    ...lead("l3"),
    ownerId: "u3",
    ownerName: "Carla Ferreira",
    deadline: "2026-08-25",
    status: "Proposta Enviada",
  },
  {
    id: "d4",
    title: "Consultoria Órbita",
    value: 15500,
    ...lead("l8"),
    ownerId: "u2",
    ownerName: "João Pedro",
    deadline: "2026-08-30",
    status: "Proposta Enviada",
  },
  {
    id: "d5",
    title: "Contrato anual Vértice",
    value: 18400,
    ...lead("l1"),
    ownerId: "u1",
    ownerName: "Ana Martins",
    deadline: "2026-08-22",
    status: "Negociação",
  },
  {
    id: "d6",
    title: "Projeto Casa Verde",
    value: 25000,
    ...lead("l6"),
    ownerId: "u3",
    ownerName: "Carla Ferreira",
    deadline: "2026-08-21",
    status: "Negociação",
  },
  {
    id: "d7",
    title: "Plano Pro - Torrefação",
    value: 7200,
    ...lead("l2"),
    ownerId: "u2",
    ownerName: "João Pedro",
    deadline: "2026-07-01",
    status: "Fechado Ganho",
  },
  {
    id: "d8",
    title: "Pacote Turismo",
    value: 12000,
    ...lead("l7"),
    ownerId: "u1",
    ownerName: "Ana Martins",
    deadline: "2026-06-30",
    status: "Fechado Perdido",
  },
];
