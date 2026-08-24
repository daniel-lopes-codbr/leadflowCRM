"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Loader2, Mail, Phone, Plus, Trash2, User } from "lucide-react";
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
  ActivityFormDialog,
  type ActivityFormValues,
} from "@/components/leads/activity-form-dialog";
import { ActivityTimeline } from "@/components/leads/activity-timeline";
import { StatusBadge } from "@/components/leads/status-badge";
import type { Activity } from "@/types/activity";
import type { Lead } from "@/types/lead";

export function LeadDetail({
  workspaceId,
  lead,
  activities,
}: {
  workspaceId: string;
  lead: Lead;
  activities: Activity[];
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleActivitySubmit(values: ActivityFormValues) {
    const result = await createActivity(workspaceId, lead.id, values);
    if (result.status === "success") {
      router.refresh();
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

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
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
              {lead.phone}
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <User className="h-4 w-4 shrink-0" />
              Responsável: {lead.ownerName}
            </div>
          </CardContent>
        </Card>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Timeline de atividades</h2>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Registrar atividade
            </Button>
          </div>
          <ActivityTimeline activities={activities} />
        </div>
      </div>

      <ActivityFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleActivitySubmit}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {lead.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              O lead e todo o histórico de atividades serão excluídos permanentemente. Essa ação
              não pode ser desfeita.
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
