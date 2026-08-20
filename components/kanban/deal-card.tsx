"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CalendarClock } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Deal } from "@/types/deal";

function isOverdue(deadline: string, status: Deal["status"]) {
  return (
    new Date(deadline).getTime() < new Date().setHours(0, 0, 0, 0) &&
    status !== "Fechado Ganho" &&
    status !== "Fechado Perdido"
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

export function DealCardBody({ deal, dragging = false }: { deal: Deal; dragging?: boolean }) {
  const overdue = isOverdue(deal.deadline, deal.status);

  return (
    <div
      className={cn(
        "w-full rounded-lg border border-border bg-background p-3.5 text-left shadow-sm transition-shadow",
        dragging ? "rotate-2 shadow-xl" : "hover:shadow-md"
      )}
    >
      <p className="text-sm font-medium leading-snug text-foreground">{deal.title}</p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{deal.leadName}</p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{formatCurrency(deal.value)}</span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
          {initials(deal.ownerName)}
        </span>
      </div>

      <div
        className={cn(
          "mt-2.5 flex items-center gap-1.5 text-xs",
          overdue ? "text-destructive" : "text-muted-foreground"
        )}
      >
        <CalendarClock className="h-3.5 w-3.5" />
        {new Date(deal.deadline).toLocaleDateString("pt-BR")}
        {overdue && " · atrasado"}
      </div>
    </div>
  );
}

export function DealCard({ deal, onClick }: { deal: Deal; onClick?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
  });

  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      className={cn("block w-full text-left", isDragging && "opacity-30")}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
    >
      <DealCardBody deal={deal} />
    </button>
  );
}
