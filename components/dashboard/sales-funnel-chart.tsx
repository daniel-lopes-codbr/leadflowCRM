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
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
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
                dataKey="name"
                position="right"
                fill="var(--foreground)"
                stroke="none"
                fontSize={12}
              />
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
      </CardContent>
    </Card>
  );
}
