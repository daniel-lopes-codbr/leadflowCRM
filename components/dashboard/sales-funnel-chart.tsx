"use client";

import { Funnel, FunnelChart, LabelList, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LeadStatus } from "@/types/lead";

const funnelStages: LeadStatus[] = [
  "Novo Lead",
  "Contato Realizado",
  "Proposta Enviada",
  "Negociação",
  "Fechado Ganho",
];

const stageColors = [
  "var(--chart-1)",
  "var(--chart-3)",
  "var(--primary)",
  "var(--chart-4)",
  "var(--success)",
];

export function SalesFunnelChart({ dealsByStatus }: { dealsByStatus: Record<LeadStatus, number> }) {
  const data = funnelStages.map((status, index) => ({
    name: status,
    value: dealsByStatus[status] ?? 0,
    fill: stageColors[index],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Funil de vendas</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 sm:flex-row">
        <ResponsiveContainer width="100%" height={280} className="sm:flex-1">
          <FunnelChart>
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                borderColor: "var(--border)",
                fontSize: 12,
              }}
            />
            <Funnel dataKey="value" data={data} isAnimationActive>
              <LabelList
                dataKey="value"
                position="center"
                fill="var(--primary-foreground)"
                stroke="none"
                fontSize={13}
                fontWeight={600}
              />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>

        <ul className="w-full shrink-0 space-y-2.5 sm:w-44">
          {data.map((stage) => (
            <li key={stage.name} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: stage.fill }}
              />
              <span className="min-w-0 flex-1 truncate text-foreground">{stage.name}</span>
              <span className="shrink-0 font-medium text-muted-foreground">{stage.value}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
