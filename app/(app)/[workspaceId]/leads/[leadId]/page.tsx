import { notFound } from "next/navigation";
import { getActivitiesByLeadId, getLeadById } from "@/components/leads/data";
import { LeadDetail } from "@/components/leads/lead-detail";

export default function LeadDetailPage({
  params,
}: {
  params: { workspaceId: string; leadId: string };
}) {
  const lead = getLeadById(params.leadId);

  if (!lead) {
    notFound();
  }

  const activities = getActivitiesByLeadId(params.leadId);

  return <LeadDetail workspaceId={params.workspaceId} lead={lead} initialActivities={activities} />;
}
