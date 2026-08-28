"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarPlus,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createActivity, deleteLead } from "@/app/(app)/[workspaceId]/leads/actions";
import {
  cancelFollowUp,
  completeFollowUp,
  createFollowUp,
  rescheduleFollowUp,
} from "@/app/(app)/[workspaceId]/leads/followup-actions";
import { createDeal } from "@/app/(app)/[workspaceId]/pipeline/actions";
import {
  ActivityFormDialog,
  type ActivityFormValues,
} from "@/components/leads/activity-form-dialog";
import { ActivityTimeline } from "@/components/leads/activity-timeline";
import { AttachmentsList } from "@/components/leads/attachments-list";
import {
  FollowUpFormDialog,
  type FollowUpFormValues,
} from "@/components/leads/followup-form-dialog";
import { RescheduleFollowUpDialog } from "@/components/leads/reschedule-followup-dialog";
import { StatusBadge } from "@/components/leads/status-badge";
import { DealFormDialog, type DealFormValues } from "@/components/kanban/deal-form-dialog";
import { buildWhatsappLink } from "@/lib/whatsapp";
import type { Activity, ActivityType } from "@/types/activity";
import type { Attachment } from "@/types/attachment";
import type { Lead } from "@/types/lead";

export function LeadDetail({
  workspaceId,
  lead,
  activities,
  attachments,
  members,
}: {
  workspaceId: string;
  lead: Lead;
  activities: Activity[];
  attachments: Attachment[];
  members: { id: string; name: string }[];
}) {
  const router = useRouter();
  const whatsappHref = buildWhatsappLink(lead.phone);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [dealDialogOpen, setDealDialogOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<Activity | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleActivitySubmit(values: ActivityFormValues) {
    const result = await createActivity(workspaceId, lead.id, values);
    if (result.status === "success") {
      router.refresh();
    }
    return result;
  }

  async function handleFollowUpSubmit(values: FollowUpFormValues) {
    const result = await createFollowUp(workspaceId, lead.id, values);
    if (result.status === "success") {
      router.refresh();
    }
    return result;
  }

  async function handleComplete(activity: Activity) {
    const result = await completeFollowUp(workspaceId, lead.id, activity.id);
    if (result.status === "success") {
      router.refresh();
    }
  }

  async function handleCancel(activity: Activity) {
    const result = await cancelFollowUp(workspaceId, lead.id, activity.id);
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
    const result = await rescheduleFollowUp(workspaceId, lead.id, rescheduleTarget.id, values);
    if (result.status === "success") {
      router.refresh();
    }
    return result;
  }

  async function handleCreateDeal(values: DealFormValues) {
    const result = await createDeal(workspaceId, values);
    if (result.status === "success" && result.dealId) {
      router.push(`/${workspaceId}/pipeline/${result.dealId}`);
    }
    return result;
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteLead(workspaceId, lead.id);
    setDeleting(false);
    if (result.status === "success") {
      router.push(`/${workspaceId}/leads`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/${workspaceId}/leads`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para leads
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setDealDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Criar negócio
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Excluir lead
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-xl">{lead.name}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{lead.role}</p>
                </div>
                <StatusBadge status={lead.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Building2 className="h-4 w-4 shrink-0" />
                {lead.company}
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <a href={`mailto:${lead.email}`} className="hover:text-foreground hover:underline">
                  {lead.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-foreground hover:underline"
                  >
                    {lead.phone}
                    <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
                  </a>
                ) : (
                  lead.phone
                )}
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <User className="h-4 w-4 shrink-0" />
                Responsável: {lead.ownerName}
              </div>
            </CardContent>
          </Card>

          <AttachmentsList workspaceId={workspaceId} leadId={lead.id} attachments={attachments} />
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-foreground">Timeline de atividades</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setFollowUpDialogOpen(true)}>
                <CalendarPlus className="h-4 w-4" />
                Agendar tarefa
              </Button>
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Registrar atividade
              </Button>
            </div>
          </div>
          <ActivityTimeline
            activities={activities}
            onComplete={handleComplete}
            onCancel={handleCancel}
            onReschedule={setRescheduleTarget}
          />
        </div>
      </div>

      <ActivityFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleActivitySubmit}
      />

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

      <DealFormDialog
        open={dealDialogOpen}
        onOpenChange={setDealDialogOpen}
        deal={null}
        leads={[{ id: lead.id, name: lead.name, company: lead.company }]}
        members={members}
        onSubmit={handleCreateDeal}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {lead.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              O lead e todo o histórico de atividades serão excluídos permanentemente. Essa ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
