import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/types/lead";

const statusStyles: Record<LeadStatus, string> = {
  "Novo Lead": "bg-secondary text-secondary-foreground",
  "Contato Realizado": "bg-accent text-accent-foreground",
  "Proposta Enviada": "bg-primary/15 text-primary",
  Negociação: "bg-primary/25 text-primary",
  "Fechado Ganho": "bg-success/15 text-success",
  "Fechado Perdido": "bg-destructive/10 text-destructive",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant="outline" className={cn("border-transparent font-medium", statusStyles[status])}>
      {status}
    </Badge>
  );
}
