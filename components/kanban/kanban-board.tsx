"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockOwners } from "@/components/leads/data";
import { mockDeals } from "@/components/kanban/data";
import { DealCardBody } from "@/components/kanban/deal-card";
import { DealFormDialog, type DealFormValues } from "@/components/kanban/deal-form-dialog";
import { KanbanColumn } from "@/components/kanban/kanban-column";
import { LEAD_STATUSES, type LeadStatus } from "@/types/lead";
import type { Deal } from "@/types/deal";
import { mockLeads } from "@/components/leads/data";

export function KanbanBoard() {
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<LeadStatus | undefined>(undefined);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const dealsByStatus = useMemo(() => {
    const grouped = Object.fromEntries(
      LEAD_STATUSES.map((status) => [status, [] as Deal[]])
    ) as Record<LeadStatus, Deal[]>;
    for (const deal of deals) grouped[deal.status].push(deal);
    return grouped;
  }, [deals]);

  function handleDragStart(event: DragStartEvent) {
    const deal = deals.find((d) => d.id === event.active.id);
    setActiveDeal(deal ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDeal(null);
    const { active, over } = event;
    if (!over) return;

    const newStatus = over.id as LeadStatus;
    setDeals((prev) =>
      prev.map((deal) => (deal.id === active.id ? { ...deal, status: newStatus } : deal))
    );
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

  function handleSubmit(values: DealFormValues) {
    const lead = mockLeads.find((l) => l.id === values.leadId)!;
    const owner = mockOwners.find((o) => o.id === values.ownerId)!;

    if (editingDeal) {
      setDeals((prev) =>
        prev.map((deal) =>
          deal.id === editingDeal.id
            ? { ...deal, ...values, leadName: lead.name, ownerName: owner.name }
            : deal
        )
      );
      return;
    }

    setDeals((prev) => [
      {
        id: `d${Date.now()}`,
        ...values,
        leadName: lead.name,
        ownerName: owner.name,
      },
      ...prev,
    ]);
  }

  return (
    <div className="space-y-4">
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
        deal={editingDeal}
        defaultStatus={defaultStatus}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
