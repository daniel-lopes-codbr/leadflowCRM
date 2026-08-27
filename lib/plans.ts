export type WorkspacePlan = "free" | "pro";

// leadsPerMonth (não total acumulado, de propósito): um teto vitalício baixo
// demais impede quem está testando de verdade de sentir o produto rodando;
// um teto mensal trava a velocidade de quem tentaria usar o Free pra sempre
// como um "Pro grátis" sem sufocar o uso legítimo (M21).
export const PLAN_LIMITS: Record<WorkspacePlan, { members: number; leadsPerMonth: number }> = {
  free: { members: 1, leadsPerMonth: 25 },
  pro: { members: Infinity, leadsPerMonth: Infinity },
};

export function startOfCurrentMonthIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}
