"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CalendarPlus,
  Contact,
  MessageCircle,
  Pencil,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateDeal } from "@/app/(app)/[workspaceId]/pipeline/actions";
import {
  cancelFollowUp,
  completeFollowUp,
  createFollowUp,
  rescheduleFollowUp,
} from "@/app/(app)/[workspaceId]/leads/followup-actions";
import { ActivityTimeline } from "@/components/leads/activity-timeline";
import {
  FollowUpFormDialog,
  type FollowUpFormValues,
} from "@/components/leads/followup-form-dialog";
import { DealFormDialog, type DealFormValues } from "@/components/kanban/deal-form-dialog";
import { RescheduleFollowUpDialog } from "@/components/leads/reschedule-followup-dialog";
import { StatusBadge } from "@/components/leads/status-badge";
import { buildWhatsappLink } from "@/lib/whatsapp";
import { formatCurrency } from "@/lib/utils";
import type { Activity, ActivityType } from "@/types/activity";
import type { Deal } from "@/types/deal";

type LeadOption = { id: string; name: string; company: string };
type Member = { id: string; name: string };

export function DealDetail({
  workspaceId,
  deal,
  leads,
  members,
}: {
  workspaceId: string;
  deal: Deal;
  leads: LeadOption[];
  members: Member[];
}) {
  const router = useRouter();
  const whatsappHref = buildWhatsappLink(deal.leadPhone);
  const [editOpen, setEditOpen] = useState(false);
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<Activity | null>(null);

  async function handleEditSubmit(values: DealFormValues) {
    const result = await updateDeal(workspaceId, deal.id, values);
    if (result.status === "success") {
      router.refresh();
    }
    return result;
  }

  async function handleFollowUpSubmit(values: FollowUpFormValues) {
    const result = await createFollowUp(workspaceId, deal.leadId, values);
    if (result.status === "success") {
      router.refresh();
    }
    return result;
  }

  async function handleComplete(activity: Activity) {
    const result = await completeFollowUp(workspaceId, deal.leadId, activity.id);
    if (result.status === "success") {
      router.refresh();
    }
  }

  async function handleCancel(activity: Activity) {
    const result = await cancelFollowUp(workspaceId, deal.leadId, activity.id);
    if (result.status === "success") {
      router.refresh();
    }
  }

  async function handleReschedule(values: {
    type: ActivityType;
    description: string;
    scheduledAt: string;
  }) {
    if (!rescheduleTarget) {
      return { status: "error" as const, message: "Tarefa não encontrada." };
    }
    const result = await rescheduleFollowUp(workspaceId, deal.leadId, rescheduleTarget.id, values);
    if (result.status === "success") {
      router.refresh();
    }
    return result;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/${workspaceId}/pipeline`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o pipeline
        </Link>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
          Editar negócio
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-xl">{deal.title}</CardTitle>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {formatCurrency(deal.value)}
                  </p>
                </div>
                <StatusBadge status={deal.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Contact className="h-4 w-4 shrink-0" />
                {deal.leadId ? (
                  <Link
                    href={`/${workspaceId}/leads/${deal.leadId}`}
                    className="hover:text-foreground hover:underline"
                  >
                    {deal.leadName}
                  </Link>
                ) : (
                  deal.leadName
                )}
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Abrir conversa no WhatsApp com ${deal.leadName}`}
                    className="inline-flex items-center hover:text-[#25D366]"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <CalendarClock className="h-4 w-4 shrink-0" />
                Prazo: {deal.deadline ? new Date(deal.deadline).toLocaleDateString("pt-BR") : "—"}
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <User className="h-4 w-4 shrink-0" />
                Responsável: {deal.ownerName}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-foreground">Tarefas</h2>
            {deal.leadId && (
              <Button size="sm" variant="outline" onClick={() => setFollowUpDialogOpen(true)}>
                <CalendarPlus className="h-4 w-4" />
                Agendar tarefa
              </Button>
            )}
          </div>
          {deal.leadId ? (
            <ActivityTimeline
              activities={deal.followUps ?? []}
              onComplete={handleComplete}
              onCancel={handleCancel}
              onReschedule={setRescheduleTarget}
            />
          ) : (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Vincule um lead pra agendar tarefas.
            </p>
          )}
        </div>
      </div>

      <DealFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        deal={deal}
        leads={leads}
        members={members}
        onSubmit={handleEditSubmit}
      />

      {deal.leadId && (
        <>
          <FollowUpFormDialog
            open={followUpDialogOpen}
            onOpenChange={setFollowUpDialogOpen}
            onSubmit={handleFollowUpSubmit}
          />

          {rescheduleTarget && (
            <RescheduleFollowUpDialog
              open={!!rescheduleTarget}
              onOpenChange={(open) => !open && setRescheduleTarget(null)}
              activity={rescheduleTarget}
              onSubmit={handleReschedule}
            />
          )}
        </>
      )}
    </div>
  );
}
