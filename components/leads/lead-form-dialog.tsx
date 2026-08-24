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
import type { LeadActionResult } from "@/app/(app)/[workspaceId]/leads/actions";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/types/lead";

const leadSchema = z.object({
  name: z.string().min(2, "Informe o nome do lead."),
  email: z.string().min(1, "Informe o e-mail.").email("Digite um e-mail válido."),
  phone: z.string().min(8, "Informe um telefone válido."),
  company: z.string().min(1, "Informe a empresa."),
  role: z.string().min(1, "Informe o cargo."),
  status: z.enum(LEAD_STATUSES),
  ownerId: z.string().min(1, "Selecione um responsável."),
});

export type LeadFormValues = z.infer<typeof leadSchema>;

export function LeadFormDialog({
  open,
  onOpenChange,
  lead,
  members,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead | null;
  members: { id: string; name: string }[];
  onSubmit: (values: LeadFormValues) => Promise<LeadActionResult>;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const defaultOwnerId = members[0]?.id ?? "";

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      role: "",
      status: "Novo Lead",
      ownerId: defaultOwnerId,
    },
  });

  useEffect(() => {
    if (!open) return;
    setServerError(null);
    reset(
      lead
        ? {
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            role: lead.role,
            status: lead.status,
            ownerId: lead.ownerId,
          }
        : {
            name: "",
            email: "",
            phone: "",
            company: "",
            role: "",
            status: "Novo Lead",
            ownerId: defaultOwnerId,
          }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lead, reset]);

  async function submit(values: LeadFormValues) {
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
          <DialogTitle>{lead ? "Editar lead" : "Novo lead"}</DialogTitle>
          <DialogDescription>
            {lead
              ? "Atualize as informações do lead."
              : "Cadastre um novo lead no funil de vendas."}
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
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" aria-invalid={!!errors.phone} {...register("phone")} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role">Cargo</Label>
              <Input id="role" aria-invalid={!!errors.role} {...register("role")} />
              {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="company">Empresa</Label>
              <Input id="company" aria-invalid={!!errors.company} {...register("company")} />
              {errors.company && (
                <p className="text-xs text-destructive">{errors.company.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
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
              {errors.ownerId && (
                <p className="text-xs text-destructive">{errors.ownerId.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {lead ? "Salvar alterações" : "Criar lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
