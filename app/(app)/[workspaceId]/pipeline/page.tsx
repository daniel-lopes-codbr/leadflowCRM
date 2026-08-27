import { KanbanBoard } from "@/components/kanban/kanban-board";
import { toOneRelation } from "@/lib/supabase/relations";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { getFollowUpStatus, type Activity, type ActivityType } from "@/types/activity";
import type { Deal } from "@/types/deal";
import type { LeadStatus } from "@/types/lead";

export default async function PipelinePage(
  props: {
    params: Promise<{ workspaceId: string }>;
  }
) {
  const params = await props.params;
  const supabase = createClient();

  const [{ data: dealRows }, { data: leadRows }, { data: memberRows }, { data: followUpRows }] =
    await Promise.all([
      supabase
        .from("deals")
        .select("id, title, value, status, deadline, lead_id, owner_id, leads(name, phone), profiles(name)")
        .eq("workspace_id", params.workspaceId)
        .order("created_at", { ascending: false }),
      supabase
        .from("leads")
        .select("id, name, company")
        .eq("workspace_id", params.workspaceId)
        .order("name"),
      supabase
        .from("memberships")
        .select("profiles(id, name)")
        .eq("workspace_id", params.workspaceId),
      // Busca todo follow-up do workspace (não só atrasados) — alimenta o
      // indicador de atraso no card E a seção de follow-ups dentro do
      // modal de edição do negócio (M23), sem duplicar a query.
      supabase
        .from("activities")
        .select(
          "id, lead_id, type, description, occurred_at, scheduled_at, completed_at, canceled_at, profiles(name)"
        )
        .eq("workspace_id", params.workspaceId)
        .not("scheduled_at", "is", null),
    ]);

  const followUpsByLead = new Map<string, Activity[]>();
  const overdueLeadIds = new Set<string>();

  for (const row of followUpRows ?? []) {
    if (!row.lead_id) continue;
    const author = toOneRelation(row.profiles as { name: string } | { name: string }[] | null);
    const activity: Activity = {
      id: row.id,
      leadId: row.lead_id,
      type: row.type as ActivityType,
      description: row.description,
      authorName: author?.name ?? "—",
      occurredAt: row.occurred_at,
      scheduledAt: row.scheduled_at,
      completedAt: row.completed_at,
      canceledAt: row.canceled_at,
    };
    const list = followUpsByLead.get(row.lead_id) ?? [];
    list.push(activity);
    followUpsByLead.set(row.lead_id, list);

    if (getFollowUpStatus(activity) === "overdue") {
      overdueLeadIds.add(row.lead_id);
    }
  }

  const deals: Deal[] = (dealRows ?? []).map((row) => {
    const lead = toOneRelation(
      row.leads as { name: string; phone: string | null } | { name: string; phone: string | null }[] | null
    );
    const owner = toOneRelation(row.profiles as { name: string } | { name: string }[] | null);
    return {
      id: row.id,
      title: row.title,
      value: Number(row.value),
      leadId: row.lead_id ?? "",
      leadName: lead?.name ?? "Sem lead vinculado",
      leadPhone: lead?.phone ?? "",
      hasOverdueFollowUp: row.lead_id ? overdueLeadIds.has(row.lead_id) : false,
      followUps: row.lead_id ? (followUpsByLead.get(row.lead_id) ?? []) : [],
      ownerId: row.owner_id ?? "",
      ownerName: owner?.name ?? "Sem responsável",
      deadline: row.deadline ?? "",
      status: row.status as LeadStatus,
    };
  });

  const leads = (leadRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    company: row.company ?? "",
  }));

  const members = (memberRows ?? [])
    .map((row) => toOneRelation(row.profiles as { id: string; name: string } | { id: string; name: string }[] | null))
    .filter((member): member is { id: string; name: string } => !!member);

  const totalPipelineValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pipeline</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Arraste os negócios entre as etapas para atualizar o status.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Valor total do pipeline</p>
          <p className="text-lg font-semibold text-foreground">
            {formatCurrency(totalPipelineValue)}
          </p>
        </div>
      </div>
      <KanbanBoard workspaceId={params.workspaceId} deals={deals} leads={leads} members={members} />
    </div>
  );
}
