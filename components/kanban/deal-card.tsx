"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CalendarClock, MessageCircle } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { buildWhatsappLink } from "@/lib/whatsapp";
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
      <p className="pr-7 text-sm font-medium leading-snug text-foreground">{deal.title}</p>
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
  const whatsappHref = buildWhatsappLink(deal.leadPhone);

  return (
    <div className="relative">
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
      {whatsappHref && (
        // Fora do <button> de propósito: useDraggable liga listeners de
        // pointer no botão, e um link aninhado dentro dele herdaria esses
        // eventos por bubbling — o clique abriria o WhatsApp e também
        // disparava o onClick do card (ou confundiria o sensor de drag).
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
          aria-label={`Abrir conversa no WhatsApp com ${deal.leadName}`}
          className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-[#25D366]"
        >
          <MessageCircle className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
