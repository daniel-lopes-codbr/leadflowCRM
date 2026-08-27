"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { AlertTriangle, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { createDeal, updateDeal, updateDealStatus } from "@/app/(app)/[workspaceId]/pipeline/actions";
import { DealCardBody } from "@/components/kanban/deal-card";
import { DealFormDialog, type DealFormValues } from "@/components/kanban/deal-form-dialog";
import { KanbanColumn } from "@/components/kanban/kanban-column";
import { LEAD_STATUSES, type LeadStatus } from "@/types/lead";
import type { Deal } from "@/types/deal";

type LeadOption = { id: string; name: string; company: string };
type Member = { id: string; name: string };

export function KanbanBoard({
  workspaceId,
  deals: initialDeals,
  leads,
  members,
}: {
  workspaceId: string;
  deals: Deal[];
  leads: LeadOption[];
  members: Member[];
}) {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<LeadStatus | undefined>(undefined);
  const [dragError, setDragError] = useState<string | null>(null);

  useEffect(() => {
    setDeals(initialDeals);
  }, [initialDeals]);

  // Mantém o modal de edição aberto sincronizado com dados atualizados do
  // servidor (ex.: follow-up criado/concluído dentro do próprio modal) —
  // sem isso, `editingDeal` fica congelado no snapshot de quando o modal
  // foi aberto, e o `router.refresh()` disparado pelas ações de follow-up
  // não teria efeito visível até fechar e reabrir o modal.
  useEffect(() => {
    if (!editingDeal) return;
    const fresh = deals.find((d) => d.id === editingDeal.id);
    if (fresh && fresh !== editingDeal) setEditingDeal(fresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deals]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const dealsByStatus = LEAD_STATUSES.reduce(
    (grouped, status) => {
      grouped[status] = deals.filter((deal) => deal.status === status);
      return grouped;
    },
    {} as Record<LeadStatus, Deal[]>
  );

  function handleDragStart(event: DragStartEvent) {
    const deal = deals.find((d) => d.id === event.active.id);
    setActiveDeal(deal ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveDeal(null);
    const { active, over } = event;
    if (!over) return;

    const dealId = String(active.id);
    const newStatus = over.id as LeadStatus;
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.status === newStatus) return;

    const previousStatus = deal.status;
    setDragError(null);
    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, status: newStatus } : d)));

    const result = await updateDealStatus(workspaceId, dealId, newStatus);
    if (result.status === "error") {
      setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, status: previousStatus } : d)));
      setDragError(result.message);
    }
  }

  function openCreateDialog(status?: LeadStatus) {
    setEditingDeal(null);
    setDefaultStatus(status);
    setDialogOpen(true);
  }

  function openEditDialog(deal: Deal) {
    setEditingDeal(deal);
    setDefaultStatus(undefined);
    setDialogOpen(true);
  }

  async function handleSubmit(values: DealFormValues) {
    const result = editingDeal
      ? await updateDeal(workspaceId, editingDeal.id, values)
      : await createDeal(workspaceId, values);

    if (result.status === "success") {
      router.refresh();
    }
    return result;
  }

  return (
    <div className="space-y-4">
      {dragError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{dragError}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-end">
        <Button onClick={() => openCreateDialog()}>
          <Plus className="h-4 w-4" />
          Novo negócio
        </Button>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {LEAD_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              deals={dealsByStatus[status]}
              onDealClick={openEditDialog}
              onAddClick={openCreateDialog}
            />
          ))}
        </div>

        <DragOverlay>{activeDeal && <DealCardBody deal={activeDeal} dragging />}</DragOverlay>
      </DndContext>

      <DealFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        workspaceId={workspaceId}
        deal={editingDeal}
        defaultStatus={defaultStatus}
        leads={leads}
        members={members}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
