import { BadgePercent, Contact, TrendingUp, Wallet } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SalesFunnelChart } from "@/components/dashboard/sales-funnel-chart";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { toOneRelation } from "@/lib/supabase/relations";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { LEAD_STATUSES, type LeadStatus } from "@/types/lead";
import type { Deal } from "@/types/deal";

const DEADLINE_WINDOW_DAYS = 7;

export default async function DashboardPage(props: { params: Promise<{ workspaceId: string }> }) {
  const params = await props.params;
  const supabase = createClient();

  const [
    {
      data: { user },
    },
    { count: totalLeads },
    { data: dealRows },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", params.workspaceId),
    supabase
      .from("deals")
      .select("id, title, value, status, deadline, lead_id, owner_id, leads(name, phone), profiles(name)")
      .eq("workspace_id", params.workspaceId),
  ]);

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
      ownerId: row.owner_id ?? "",
      ownerName: owner?.name ?? "Sem responsável",
      deadline: row.deadline ?? "",
      status: row.status as LeadStatus,
    };
  });

  const openDeals = deals.filter(
    (deal) => deal.status !== "Fechado Ganho" && deal.status !== "Fechado Perdido"
  );
  const pipelineValue = openDeals.reduce((sum, deal) => sum + deal.value, 0);

  const wonDeals = deals.filter((deal) => deal.status === "Fechado Ganho").length;
  const conversionRate = deals.length > 0 ? (wonDeals / deals.length) * 100 : 0;

  const dealsByStatus = Object.fromEntries(
    LEAD_STATUSES.map((status) => [status, deals.filter((d) => d.status === status).length])
  ) as Record<LeadStatus, number>;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const windowEnd = new Date(today);
  windowEnd.setDate(windowEnd.getDate() + DEADLINE_WINDOW_DAYS);

  const upcomingDeals = openDeals
    .filter((deal) => deal.ownerId === user?.id && new Date(deal.deadline) <= windowEnd)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão geral do funil de vendas deste workspace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Contact} label="Total de leads" value={String(totalLeads ?? 0)} />
        <MetricCard icon={TrendingUp} label="Negócios abertos" value={String(openDeals.length)} />
        <MetricCard
          icon={Wallet}
          label="Valor total do pipeline"
          value={formatCurrency(pipelineValue)}
        />
        <MetricCard
          icon={BadgePercent}
          label="Taxa de conversão"
          value={`${conversionRate.toFixed(0)}%`}
          hint={`${wonDeals} de ${deals.length} negócios ganhos`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <SalesFunnelChart dealsByStatus={dealsByStatus} />
        <UpcomingDeadlines deals={upcomingDeals} workspaceId={params.workspaceId} />
      </div>
    </div>
  );
}
