import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Deal } from "@/types/deal";

export function UpcomingDeadlines({ deals, workspaceId }: { deals: Deal[]; workspaceId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Prazos próximos</CardTitle>
      </CardHeader>
      <CardContent>
        {deals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum negócio aberto com prazo nos próximos 7 dias.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {deals.map((deal) => {
              const overdue = new Date(deal.deadline).getTime() < new Date().setHours(0, 0, 0, 0);
              return (
                <li
                  key={deal.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/${workspaceId}/pipeline`}
                      className="truncate text-sm font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {deal.title}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {deal.leadName} · {deal.ownerName}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(deal.value)}
                    </span>
                    <span
                      className={`flex items-center gap-1 text-xs ${overdue ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      <CalendarClock className="h-3.5 w-3.5" />
                      {new Date(deal.deadline).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
