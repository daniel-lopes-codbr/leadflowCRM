"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { mockLeads, mockOwners } from "@/components/leads/data";
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

export function DealFormDialog({
  open,
  onOpenChange,
  deal,
  defaultStatus,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Deal | null;
  defaultStatus?: LeadStatus;
  onSubmit: (values: DealFormValues) => void;
}) {
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
      leadId: mockLeads[0].id,
      ownerId: mockOwners[0].id,
      deadline: "",
      status: defaultStatus ?? "Novo Lead",
    },
  });

  useEffect(() => {
    if (!open) return;
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
            leadId: mockLeads[0].id,
            ownerId: mockOwners[0].id,
            deadline: "",
            status: defaultStatus ?? "Novo Lead",
          }
    );
  }, [open, deal, defaultStatus, reset]);

  async function submit(values: DealFormValues) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    onSubmit(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{deal ? "Editar negócio" : "Novo negócio"}</DialogTitle>
          <DialogDescription>
            {deal ? "Atualize as informações do negócio." : "Adicione um negócio ao pipeline."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
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
                {mockLeads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.name} · {lead.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  {mockOwners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.name}
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
    </Dialog>
  );
}
