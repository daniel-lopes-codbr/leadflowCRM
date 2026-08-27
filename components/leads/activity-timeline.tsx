"use client";

import { Check, Mail, MessageSquare, Phone, RotateCcw, UserCog, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFollowUpStatus, type Activity, type ActivityType, type FollowUpStatus } from "@/types/activity";

const activityIcons: Record<ActivityType, typeof Phone> = {
  Ligação: Phone,
  "E-mail": Mail,
  Reunião: Users,
  Nota: MessageSquare,
  Responsável: UserCog,
};

const statusBadges: Partial<Record<FollowUpStatus, { label: string; className: string }>> = {
  pending: { label: "Agendado", className: "bg-primary/10 text-primary" },
  overdue: { label: "Atrasado", className: "bg-destructive/10 text-destructive" },
  completed: { label: "Concluído", className: "bg-success/15 text-success" },
  canceled: { label: "Cancelado", className: "bg-secondary text-muted-foreground" },
};

function displayDateLabel(activity: Activity) {
  if (activity.scheduledAt) {
    return new Date(activity.scheduledAt).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (activity.occurredAt) {
    return new Date(activity.occurredAt).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return null;
}

export function ActivityTimeline({
  activities,
  onComplete,
  onCancel,
  onReschedule,
}: {
  activities: Activity[];
  onComplete: (activity: Activity) => void;
  onCancel: (activity: Activity) => void;
  onReschedule: (activity: Activity) => void;
}) {
  if (activities.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Nenhuma atividade registrada ainda.
      </p>
    );
  }

  return (
    <ol className="space-y-6">
      {activities.map((activity) => {
        const Icon = activityIcons[activity.type];
        const status = getFollowUpStatus(activity);
        const badge = statusBadges[status];
        const isActionable = status === "pending" || status === "overdue";

        return (
          <li key={activity.id} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <Icon className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-sm font-medium text-foreground">{activity.type}</span>
                {badge && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">· {activity.authorName}</span>
                {displayDateLabel(activity) && (
                  <span className="text-xs text-muted-foreground">· {displayDateLabel(activity)}</span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
              {isActionable && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onComplete(activity)}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Concluir
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onReschedule(activity)}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reagendar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => onCancel(activity)}
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
