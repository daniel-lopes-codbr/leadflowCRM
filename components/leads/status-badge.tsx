import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { LeadStatus } from "@/types/lead";

const statusVariant: Record<LeadStatus, BadgeProps["variant"]> = {
  "Novo Lead": "neutral",
  "Contato Realizado": "accent",
  "Proposta Enviada": "soft",
  Negociação: "soft-strong",
  "Fechado Ganho": "success",
  "Fechado Perdido": "destructive-soft",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant={statusVariant[status]} className="font-medium">
      {status}
    </Badge>
  );
}
