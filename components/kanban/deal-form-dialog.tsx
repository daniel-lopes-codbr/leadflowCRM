"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AlertTriangle, CalendarPlus } from "lucide-react";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DealActionResult } from "@/app/(app)/[workspaceId]/pipeline/actions";
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
import { RescheduleFollowUpDialog } from "@/components/leads/reschedule-followup-dialog";
import type { Activity } from "@/types/activity";
import { LEAD_STATUSES, type LeadStatus } from "@/types/lead";
import type { Deal } from "@/types/deal";

const dealSchema = z.object({
  title: z.string().min(2, "Dê um título ao negócio."),
  value: z.number({ error: "Informe um valor válido." }).min(0, "Informe um valor válido."),
  leadId: z.string().min(1, "Selecione o lead vinculado."),
  ownerId: z.string().min(1, "Selecione um responsável."),
  deadline: z.string().min(1, "Informe o prazo."),
  status: z.enum(LEAD_STATUSES),
});

export type DealFormValues = z.infer<typeof dealSchema>;

type LeadOption = { id: string; name: string; company: string };
type Member = { id: string; name: string };

export function DealFormDialog({
  open,
  onOpenChange,
  workspaceId,
  deal,
  defaultStatus,
  leads,
  members,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  deal?: Deal | null;
  defaultStatus?: LeadStatus;
  leads: LeadOption[];
  members: Member[];
  onSubmit: (values: DealFormValues) => Promise<DealActionResult>;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<Activity | null>(null);
  const defaultLeadId = leads[0]?.id ?? "";
  const defaultOwnerId = members[0]?.id ?? "";

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: "",
      value: 0,
      leadId: defaultLeadId,
      ownerId: defaultOwnerId,
      deadline: "",
      status: defaultStatus ?? "Novo Lead",
    },
  });

  useEffect(() => {
    if (!open) return;
    setServerError(null);
    reset(
      deal
        ? {
            title: deal.title,
            value: deal.value,
            leadId: deal.leadId,
            ownerId: deal.ownerId,
            deadline: deal.deadline,
            status: deal.status,
          }
        : {
            title: "",
            value: 0,
            leadId: defaultLeadId,
            ownerId: defaultOwnerId,
            deadline: "",
            status: defaultStatus ?? "Novo Lead",
          }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, deal, defaultStatus, reset]);

  async function submit(values: DealFormValues) {
    setServerError(null);
    const result = await onSubmit(values);
    if (result.status === "error") {
      setServerError(result.message);
      return;
    }
    onOpenChange(false);
  }

  async function handleFollowUpSubmit(values: FollowUpFormValues) {
    const result = await createFollowUp(workspaceId, deal!.leadId, values);
    if (result.status === "success") {
      router.refresh();
    }
    return result;
  }

  async function handleFollowUpComplete(activity: Activity) {
    const result = await completeFollowUp(workspaceId, deal!.leadId, activity.id);
    if (result.status === "success") {
      router.refresh();
    }
  }

  async function handleFollowUpCancel(activity: Activity) {
    const result = await cancelFollowUp(workspaceId, deal!.leadId, activity.id);
    if (result.status === "success") {
      router.refresh();
    }
  }

  async function handleFollowUpReschedule(newScheduledAt: string) {
    if (!rescheduleTarget || !deal) {
      return { status: "error" as const, message: "Follow-up não encontrado." };
    }
    const result = await rescheduleFollowUp(
      workspaceId,
      deal.leadId,
      rescheduleTarget.id,
      newScheduledAt
    );
    if (result.status === "success") {
      router.refresh();
    }
    return result;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{deal ? "Editar negócio" : "Novo negócio"}</DialogTitle>
          <DialogDescription>
            {deal ? "Atualize as informações do negócio." : "Adicione um negócio ao pipeline."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          {serverError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="title">Título</Label>
            <Input id="title" aria-invalid={!!errors.title} {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="value">Valor estimado (R$)</Label>
              <Input
                id="value"
                type="number"
                min={0}
                step="0.01"
                aria-invalid={!!errors.value}
                {...register("value", { valueAsNumber: true })}
              />
              {errors.value && <p className="text-xs text-destructive">{errors.value.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deadline">Prazo</Label>
              <Input
                id="deadline"
                type="date"
                aria-invalid={!!errors.deadline}
                {...register("deadline")}
              />
              {errors.deadline && (
                <p className="text-xs text-destructive">{errors.deadline.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Lead vinculado</Label>
            <Select value={watch("leadId")} onValueChange={(value) => setValue("leadId", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.name} · {lead.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.leadId && <p className="text-xs text-destructive">{errors.leadId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Responsável</Label>
              <Select
                value={watch("ownerId")}
                onValueChange={(value) => setValue("ownerId", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Etapa</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as LeadStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {deal && (
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">Follow-ups</h3>
                {deal.leadId && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setFollowUpDialogOpen(true)}
                  >
                    <CalendarPlus className="h-3.5 w-3.5" />
                    Agendar follow-up
                  </Button>
                )}
              </div>
              {deal.leadId ? (
                <ActivityTimeline
                  activities={deal.followUps ?? []}
                  onComplete={handleFollowUpComplete}
                  onCancel={handleFollowUpCancel}
                  onReschedule={setRescheduleTarget}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Vincule um lead pra agendar follow-ups.
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {deal ? "Salvar alterações" : "Criar negócio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {deal && deal.leadId && (
        <>
          <FollowUpFormDialog
            open={followUpDialogOpen}
            onOpenChange={setFollowUpDialogOpen}
            onSubmit={handleFollowUpSubmit}
          />

          {rescheduleTarget && (
            <RescheduleFollowUpDialog
              open={!!rescheduleTarget}
              onOpenChange={(nextOpen) => !nextOpen && setRescheduleTarget(null)}
              currentScheduledAt={rescheduleTarget.scheduledAt ?? ""}
              onSubmit={handleFollowUpReschedule}
            />
          )}
        </>
      )}
    </Dialog>
  );
}
