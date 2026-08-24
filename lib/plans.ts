export type WorkspacePlan = "free" | "pro";

export const PLAN_LIMITS: Record<WorkspacePlan, { members: number; leads: number }> = {
  free: { members: 1, leads: 25 },
  pro: { members: Infinity, leads: Infinity },
};
