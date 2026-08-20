import { BadgePercent, Contact, TrendingUp, Wallet } from "lucide-react";
import { mockDeals } from "@/components/kanban/data";
import { mockLeads } from "@/components/leads/data";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SalesFunnelChart } from "@/components/dashboard/sales-funnel-chart";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { formatCurrency } from "@/lib/utils";
import { LEAD_STATUSES, type LeadStatus } from "@/types/lead";

const DEADLINE_WINDOW_DAYS = 7;

export default function DashboardPage({ params }: { params: { workspaceId: string } }) {
  const totalLeads = mockLeads.length;

  const openDeals = mockDeals.filter(
    (deal) => deal.status !== "Fechado Ganho" && deal.status !== "Fechado Perdido"
  );
  const pipelineValue = openDeals.reduce((sum, deal) => sum + deal.value, 0);

  const wonDeals = mockDeals.filter((deal) => deal.status === "Fechado Ganho").length;
  const conversionRate = mockDeals.length > 0 ? (wonDeals / mockDeals.length) * 100 : 0;

  const dealsByStatus = Object.fromEntries(
    LEAD_STATUSES.map((status) => [status, mockDeals.filter((d) => d.status === status).length])
  ) as Record<LeadStatus, number>;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const windowEnd = new Date(today);
  windowEnd.setDate(windowEnd.getDate() + DEADLINE_WINDOW_DAYS);

  const upcomingDeals = openDeals
    .filter((deal) => new Date(deal.deadline) <= windowEnd)
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
        <MetricCard icon={Contact} label="Total de leads" value={String(totalLeads)} />
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
          hint={`${wonDeals} de ${mockDeals.length} negócios ganhos`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <SalesFunnelChart dealsByStatus={dealsByStatus} />
        <UpcomingDeadlines deals={upcomingDeals} workspaceId={params.workspaceId} />
      </div>
    </div>
  );
}
