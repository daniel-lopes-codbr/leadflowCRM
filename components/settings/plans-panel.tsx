"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Check, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { createCheckoutSession, createPortalSession } from "@/app/(app)/[workspaceId]/settings/billing-actions";
import { PLAN_LIMITS, type WorkspacePlan } from "@/lib/plans";

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

export function PlansPanel({
  workspaceId,
  plan,
  membersUsed,
  leadsUsed,
}: {
  workspaceId: string;
  plan: WorkspacePlan;
  membersUsed: number;
  leadsUsed: number;
}) {
  const searchParams = useSearchParams();
  const checkoutStatus = searchParams.get("checkout");
  const [upgrading, setUpgrading] = useState(false);
  const [managing, setManaging] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const currentPlan = plan;
  const limits = PLAN_LIMITS[currentPlan];

  async function handleUpgrade() {
    setActionError(null);
    setUpgrading(true);
    const result = await createCheckoutSession(workspaceId);
    setUpgrading(false);
    if (result?.status === "error") setActionError(result.message);
  }

  async function handleManageSubscription() {
    setActionError(null);
    setManaging(true);
    const result = await createPortalSession(workspaceId);
    setManaging(false);
    if (result?.status === "error") setActionError(result.message);
  }

  return (
    <div className="space-y-6">
      {checkoutStatus === "success" && (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Pagamento confirmado! Seu plano é atualizado assim que o Stripe conclui o processamento
            — recarregue em alguns segundos se ainda estiver aparecendo Free.
          </AlertDescription>
        </Alert>
      )}
      {checkoutStatus === "cancelled" && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Checkout cancelado. Nenhuma cobrança foi feita.</AlertDescription>
        </Alert>
      )}
      {actionError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

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
                  {membersUsed} / {limits.members}
                </span>
              </div>
              <Progress
                value={Math.min((membersUsed / limits.members) * 100, 100)}
                className={membersUsed >= limits.members ? "[&>div]:bg-destructive" : ""}
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Leads</span>
                <span className="font-medium text-foreground">
                  {leadsUsed} / {limits.leads}
                </span>
              </div>
              <Progress value={Math.min((leadsUsed / limits.leads) * 100, 100)} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((planOption) => {
          const isCurrent = planOption.id === currentPlan;
          return (
            <Card key={planOption.id} className={isCurrent ? "border-primary" : undefined}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{planOption.name}</CardTitle>
                  {isCurrent && <Badge>Plano atual</Badge>}
                </div>
                <p className="pt-1 text-2xl font-semibold text-foreground">{planOption.price}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {planOption.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {planOption.id === "pro" && currentPlan === "free" && (
                  <Button className="w-full" onClick={handleUpgrade} disabled={upgrading}>
                    {upgrading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Assinar Pro
                  </Button>
                )}
                {planOption.id === "pro" && currentPlan === "pro" && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleManageSubscription}
                    disabled={managing}
                  >
                    {managing && <Loader2 className="h-4 w-4 animate-spin" />}
                    Gerenciar assinatura
                  </Button>
                )}
                {planOption.id === "free" && isCurrent && (
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
