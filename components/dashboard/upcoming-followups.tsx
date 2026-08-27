import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityType } from "@/types/activity";

type UpcomingFollowUp = {
  id: string;
  leadId: string;
  leadName: string;
  description: string;
  type: ActivityType;
  scheduledAt: string;
  overdue: boolean;
};

export function UpcomingFollowUps({
  followUps,
  workspaceId,
}: {
  followUps: UpcomingFollowUp[];
  workspaceId: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Follow-ups de hoje e atrasados</CardTitle>
      </CardHeader>
      <CardContent>
        {followUps.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum follow-up pendente pra você.</p>
        ) : (
          <ul className="divide-y divide-border">
            {followUps.map((followUp) => (
              <li
                key={followUp.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <Link
                    href={`/${workspaceId}/leads/${followUp.leadId}`}
                    className="truncate text-sm font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {followUp.leadName}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {followUp.type} · {followUp.description}
                  </p>
                </div>
                <span
                  className={`flex shrink-0 items-center gap-1 text-xs ${followUp.overdue ? "text-destructive" : "text-muted-foreground"}`}
                >
                  <CalendarClock className="h-3.5 w-3.5" />
                  {new Date(followUp.scheduledAt).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {followUp.overdue && " · atrasado"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
