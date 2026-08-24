import { notFound } from "next/navigation";
import { LeadDetail } from "@/components/leads/lead-detail";
import { toOneRelation } from "@/lib/supabase/relations";
import { createClient } from "@/lib/supabase/server";
import type { Activity, ActivityType } from "@/types/activity";
import type { Lead, LeadStatus } from "@/types/lead";

export default async function LeadDetailPage({
  params,
}: {
  params: { workspaceId: string; leadId: string };
}) {
  const supabase = createClient();

  const { data: leadRow } = await supabase
    .from("leads")
    .select("id, name, email, phone, company, role, status, owner_id, created_at, profiles(name)")
    .eq("id", params.leadId)
    .eq("workspace_id", params.workspaceId)
    .maybeSingle();

  if (!leadRow) {
    notFound();
  }

  const owner = toOneRelation(leadRow.profiles as { name: string } | { name: string }[] | null);
  const lead: Lead = {
    id: leadRow.id,
    name: leadRow.name,
    email: leadRow.email ?? "",
    phone: leadRow.phone ?? "",
    company: leadRow.company ?? "",
    role: leadRow.role ?? "",
    status: leadRow.status as LeadStatus,
    ownerId: leadRow.owner_id ?? "",
    ownerName: owner?.name ?? "Sem responsável",
    createdAt: leadRow.created_at,
  };

  const { data: activityRows } = await supabase
    .from("activities")
    .select("id, lead_id, type, description, occurred_at, profiles(name)")
    .eq("lead_id", params.leadId)
    .order("occurred_at", { ascending: false });

  const activities: Activity[] = (activityRows ?? []).map((row) => {
    const author = toOneRelation(row.profiles as { name: string } | { name: string }[] | null);
    return {
      id: row.id,
      leadId: row.lead_id,
      type: row.type as ActivityType,
      description: row.description,
      authorName: author?.name ?? "Usuário removido",
      occurredAt: row.occurred_at,
    };
  });

  return <LeadDetail workspaceId={params.workspaceId} lead={lead} activities={activities} />;
}
