"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AlertTriangle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import type { FollowUpActionResult } from "@/app/(app)/[workspaceId]/leads/followup-actions";
import { ACTIVITY_TYPES, type ActivityType } from "@/types/activity";

const followUpSchema = z.object({
  type: z.enum(ACTIVITY_TYPES),
  description: z.string().min(3, "Descreva o que precisa ser feito."),
  scheduledAt: z.string().min(1, "Informe a data."),
});

export type FollowUpFormValues = z.infer<typeof followUpSchema>;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function FollowUpFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FollowUpFormValues) => Promise<FollowUpActionResult>;
}) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FollowUpFormValues>({
    resolver: zodResolver(followUpSchema),
    defaultValues: { type: "Ligação", description: "", scheduledAt: todayIso() },
  });

  useEffect(() => {
    if (!open) return;
    setServerError(null);
    reset({ type: "Ligação", description: "", scheduledAt: todayIso() });
  }, [open, reset]);

  async function submit(values: FollowUpFormValues) {
    setServerError(null);
    const result = await onSubmit(values);
    if (result.status === "error") {
      setServerError(result.message);
      return;
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agendar follow-up</DialogTitle>
          <DialogDescription>
            Programe a próxima ação com este lead — você recebe um lembrete por e-mail no dia
            agendado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          {serverError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select
                value={watch("type")}
                onValueChange={(value) => setValue("type", value as ActivityType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.filter((type) => type !== "Responsável").map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="scheduledAt">Data agendada</Label>
              <Input
                id="scheduledAt"
                type="date"
                aria-invalid={!!errors.scheduledAt}
                {...register("scheduledAt")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="followup-description">Descrição</Label>
            <Textarea
              id="followup-description"
              rows={4}
              placeholder="O que precisa ser feito?"
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Agendar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
