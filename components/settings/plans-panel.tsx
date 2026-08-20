"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { mockUsage, planLimits } from "@/components/settings/data";

const plans = [
  {
    id: "free" as const,
    name: "Free",
    price: "R$ 0",
    features: ["1 colaborador", "Até 25 leads", "Pipeline Kanban completo", "Dashboard básico"],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "R$ 49/mês",
    features: [
      "Colaboradores ilimitados",
      "Leads ilimitados",
      "Tudo do plano Free",
      "Exportação de dados",
      "Suporte prioritário",
    ],
  },
];

export function PlansPanel() {
  const [upgrading, setUpgrading] = useState(false);
  const currentPlan = mockUsage.plan;
  const limits = planLimits[currentPlan];

  async function handleUpgrade() {
    setUpgrading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setUpgrading(false);
  }

  return (
    <div className="space-y-6">
      {currentPlan === "free" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Uso do plano Free</CardTitle>
            <CardDescription>Acompanhe seus limites atuais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Colaboradores</span>
                <span className="font-medium text-foreground">
                  {mockUsage.membersUsed} / {limits.members}
                </span>
              </div>
              <Progress
                value={Math.min((mockUsage.membersUsed / limits.members) * 100, 100)}
                className={mockUsage.membersUsed >= limits.members ? "[&>div]:bg-destructive" : ""}
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Leads</span>
                <span className="font-medium text-foreground">
                  {mockUsage.leadsUsed} / {limits.leads}
                </span>
              </div>
              <Progress value={Math.min((mockUsage.leadsUsed / limits.leads) * 100, 100)} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <Card key={plan.id} className={isCurrent ? "border-primary" : undefined}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  {isCurrent && <Badge>Plano atual</Badge>}
                </div>
                <p className="pt-1 text-2xl font-semibold text-foreground">{plan.price}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.id === "pro" && currentPlan === "free" && (
                  <Button className="w-full" onClick={handleUpgrade} disabled={upgrading}>
                    {upgrading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Assinar Pro
                  </Button>
                )}
                {isCurrent && (
                  <Button className="w-full" variant="outline" disabled>
                    Plano atual
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
