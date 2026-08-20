export type MemberRole = "Admin" | "Membro";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
}

export const mockWorkspace = {
  name: "Estúdio Vértice",
  logoUrl: null as string | null,
};

export const mockMembers: Member[] = [
  { id: "u1", name: "Ana Martins", email: "ana@leadflow.com", role: "Admin" },
  { id: "u2", name: "João Pedro", email: "joao@leadflow.com", role: "Membro" },
  { id: "u3", name: "Carla Ferreira", email: "carla@leadflow.com", role: "Membro" },
];

export const planLimits = {
  free: { members: 1, leads: 25 },
  pro: { members: Infinity, leads: Infinity },
} as const;

export const mockUsage = {
  plan: "free" as "free" | "pro",
  membersUsed: mockMembers.length,
  leadsUsed: 8,
};
