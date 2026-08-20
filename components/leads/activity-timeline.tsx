import { Mail, MessageSquare, Phone, Users } from "lucide-react";
import type { Activity, ActivityType } from "@/types/activity";

const activityIcons: Record<ActivityType, typeof Phone> = {
  Ligação: Phone,
  "E-mail": Mail,
  Reunião: Users,
  Nota: MessageSquare,
};

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
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
        return (
          <li key={activity.id} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <Icon className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-sm font-medium text-foreground">{activity.type}</span>
                <span className="text-xs text-muted-foreground">· {activity.authorName}</span>
                <span className="text-xs text-muted-foreground">
                  ·{" "}
                  {new Date(activity.occurredAt).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
