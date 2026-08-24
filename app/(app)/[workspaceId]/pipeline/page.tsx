import { KanbanBoard } from "@/components/kanban/kanban-board";
import { toOneRelation } from "@/lib/supabase/relations";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import type { Deal } from "@/types/deal";
import type { LeadStatus } from "@/types/lead";

export default async function PipelinePage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const supabase = createClient();

  const [{ data: dealRows }, { data: leadRows }, { data: memberRows }] = await Promise.all([
    supabase
      .from("deals")
      .select("id, title, value, status, deadline, lead_id, owner_id, leads(name), profiles(name)")
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
  ]);

  const deals: Deal[] = (dealRows ?? []).map((row) => {
    const lead = toOneRelation(row.leads as { name: string } | { name: string }[] | null);
    const owner = toOneRelation(row.profiles as { name: string } | { name: string }[] | null);
    return {
      id: row.id,
      title: row.title,
      value: Number(row.value),
      leadId: row.lead_id ?? "",
      leadName: lead?.name ?? "Sem lead vinculado",
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
