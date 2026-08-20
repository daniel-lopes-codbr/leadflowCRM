"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DealCard } from "@/components/kanban/deal-card";
import type { Deal } from "@/types/deal";
import type { LeadStatus } from "@/types/lead";

export function KanbanColumn({
  status,
  deals,
  onDealClick,
  onAddClick,
}: {
  status: LeadStatus;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onAddClick: (status: LeadStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const total = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className="bg-secondary/40 flex w-72 shrink-0 flex-col rounded-xl">
      <div className="flex items-center justify-between px-3.5 pt-3.5">
        <h3 className="text-sm font-semibold text-foreground">{status}</h3>
        <div className="flex items-center gap-1">
          <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {deals.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label={`Novo negócio em ${status}`}
            onClick={() => onAddClick(status)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <p className="px-3.5 pb-3 pt-0.5 text-xs text-muted-foreground">{formatCurrency(total)}</p>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[6rem] flex-1 flex-col gap-2.5 rounded-b-xl p-2.5 transition-colors",
          isOver && "bg-primary/10"
        )}
      >
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} onClick={() => onDealClick(deal)} />
        ))}
        {deals.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Arraste um negócio para cá
          </div>
        )}
      </div>
    </div>
  );
}
