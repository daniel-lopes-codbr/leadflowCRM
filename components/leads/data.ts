import type { Activity } from "@/types/activity";
import type { Lead } from "@/types/lead";

export const mockOwners = [
  { id: "u1", name: "Ana Martins" },
  { id: "u2", name: "João Pedro" },
  { id: "u3", name: "Carla Ferreira" },
] as const;

export const mockLeads: Lead[] = [
  {
    id: "l1",
    name: "Rafael Souza",
    email: "rafael@vertice.com.br",
    phone: "(11) 98220-4471",
    company: "Estúdio Vértice",
    role: "Sócio-diretor",
    status: "Negociação",
    ownerId: "u1",
    ownerName: "Ana Martins",
    createdAt: "2026-07-02",
  },
  {
    id: "l2",
    name: "Beatriz Lima",
    email: "beatriz@graotorrefacao.com.br",
    phone: "(21) 97711-2290",
    company: "Grão Torrefação",
    role: "Compras",
    status: "Fechado Ganho",
    ownerId: "u2",
    ownerName: "João Pedro",
    createdAt: "2026-06-18",
  },
  {
    id: "l3",
    name: "Marcelo Nunes",
    email: "marcelo@nortis.eng.br",
    phone: "(31) 99044-1187",
    company: "Nortis Engenharia",
    role: "Gerente de Projetos",
    status: "Proposta Enviada",
    ownerId: "u3",
    ownerName: "Carla Ferreira",
    createdAt: "2026-07-14",
  },
  {
    id: "l4",
    name: "Juliana Prado",
    email: "juliana@lumencontabil.com.br",
    phone: "(11) 96650-3321",
    company: "Lumen Contabilidade",
    role: "Sócia",
    status: "Novo Lead",
    ownerId: "u1",
    ownerName: "Ana Martins",
    createdAt: "2026-08-01",
  },
  {
    id: "l5",
    name: "Diego Ramos",
    email: "diego@vetorfitness.com",
    phone: "(41) 98877-6612",
    company: "Vetor Fitness",
    role: "Franqueado",
    status: "Contato Realizado",
    ownerId: "u2",
    ownerName: "João Pedro",
    createdAt: "2026-07-28",
  },
  {
    id: "l6",
    name: "Patrícia Alves",
    email: "patricia@casaverde.arq.br",
    phone: "(51) 99120-4456",
    company: "Casa Verde Arquitetura",
    role: "Arquiteta responsável",
    status: "Negociação",
    ownerId: "u3",
    ownerName: "Carla Ferreira",
    createdAt: "2026-07-09",
  },
  {
    id: "l7",
    name: "Eduardo Faria",
    email: "eduardo@picoturismo.com.br",
    phone: "(85) 98765-1120",
    company: "Pico Turismo",
    role: "Diretor Comercial",
    status: "Fechado Perdido",
    ownerId: "u1",
    ownerName: "Ana Martins",
    createdAt: "2026-06-25",
  },
  {
    id: "l8",
    name: "Camila Duarte",
    email: "camila@orbitamkt.com.br",
    phone: "(19) 99011-3345",
    company: "Órbita Marketing",
    role: "CEO",
    status: "Proposta Enviada",
    ownerId: "u2",
    ownerName: "João Pedro",
    createdAt: "2026-08-10",
  },
] as const as Lead[];

export const mockActivities: Activity[] = [
  {
    id: "a1",
    leadId: "l1",
    type: "Ligação",
    description: "Alinhamos escopo inicial e enviei o catálogo de planos por e-mail.",
    authorName: "Ana Martins",
    occurredAt: "2026-07-03T14:30:00",
  },
  {
    id: "a2",
    leadId: "l1",
    type: "E-mail",
    description: "Encaminhada proposta comercial com desconto de lançamento.",
    authorName: "Ana Martins",
    occurredAt: "2026-07-20T09:15:00",
  },
  {
    id: "a3",
    leadId: "l1",
    type: "Reunião",
    description: "Demonstração do produto com os dois sócios. Boa receptividade.",
    authorName: "Ana Martins",
    occurredAt: "2026-08-05T16:00:00",
  },
  {
    id: "a4",
    leadId: "l2",
    type: "Nota",
    description: "Cliente pediu nota fiscal com CNPJ da matriz, não da filial.",
    authorName: "João Pedro",
    occurredAt: "2026-06-20T11:00:00",
  },
  {
    id: "a5",
    leadId: "l2",
    type: "Ligação",
    description: "Confirmado fechamento do plano Pro anual.",
    authorName: "João Pedro",
    occurredAt: "2026-07-01T10:20:00",
  },
  {
    id: "a6",
    leadId: "l3",
    type: "E-mail",
    description: "Proposta técnica enviada, aguardando validação da diretoria.",
    authorName: "Carla Ferreira",
    occurredAt: "2026-07-15T08:45:00",
  },
] as const as Activity[];

export function getLeadById(leadId: string) {
  return mockLeads.find((lead) => lead.id === leadId);
}

export function getActivitiesByLeadId(leadId: string) {
  return mockActivities
    .filter((activity) => activity.leadId === leadId)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}
