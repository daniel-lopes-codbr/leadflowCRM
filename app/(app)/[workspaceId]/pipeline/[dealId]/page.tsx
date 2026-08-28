import { notFound } from "next/navigation";
import { DealDetail } from "@/components/kanban/deal-detail";
import { toOneRelation } from "@/lib/supabase/relations";
import { createClient } from "@/lib/supabase/server";
import { getFollowUpStatus, type Activity, type ActivityType } from "@/types/activity";
import type { Deal } from "@/types/deal";
import type { LeadStatus } from "@/types/lead";

export default async function DealDetailPage(
  props: {
    params: Promise<{ workspaceId: string; dealId: string }>;
  }
) {
  const params = await props.params;
  const supabase = createClient();

  const [{ data: dealRow }, { data: leadRows }, { data: memberRows }] = await Promise.all([
    supabase
      .from("deals")
      .select(
        "id, title, value, status, deadline, lead_id, owner_id, leads(name, phone), profiles(name)"
      )
      .eq("id", params.dealId)
      .eq("workspace_id", params.workspaceId)
      .maybeSingle(),
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

  if (!dealRow) {
    notFound();
  }

  const lead = toOneRelation(
    dealRow.leads as { name: string; phone: string | null } | { name: string; phone: string | null }[] | null
  );
  const owner = toOneRelation(dealRow.profiles as { name: string } | { name: string }[] | null);

  let followUps: Activity[] = [];
  if (dealRow.lead_id) {
    const { data: activityRows } = await supabase
      .from("activities")
      .select(
        "id, lead_id, type, description, occurred_at, scheduled_at, completed_at, canceled_at, profiles(name)"
      )
      .eq("lead_id", dealRow.lead_id)
      .order("created_at", { ascending: false });

    followUps = (activityRows ?? []).map((row) => {
      const author = toOneRelation(row.profiles as { name: string } | { name: string }[] | null);
      return {
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
    });
  }

  const deal: Deal = {
    id: dealRow.id,
    title: dealRow.title,
    value: Number(dealRow.value),
    leadId: dealRow.lead_id ?? "",
    leadName: lead?.name ?? "Sem lead vinculado",
    leadPhone: lead?.phone ?? "",
    hasOverdueFollowUp: followUps.some((activity) => getFollowUpStatus(activity) === "overdue"),
    followUps,
    ownerId: dealRow.owner_id ?? "",
    ownerName: owner?.name ?? "Sem responsável",
    deadline: dealRow.deadline ?? "",
    status: dealRow.status as LeadStatus,
  };

  const leads = (leadRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    company: row.company ?? "",
  }));

  const members = (memberRows ?? [])
    .map((row) => toOneRelation(row.profiles as { id: string; name: string } | { id: string; name: string }[] | null))
    .filter((member): member is { id: string; name: string } => !!member);

  return (
    <DealDetail workspaceId={params.workspaceId} deal={deal} leads={leads} members={members} />
  );
}
