"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type OverdueTask = {
  id: string;
  leadId: string | null;
  leadName: string;
  description: string;
  type: string;
  scheduledAt: string;
};

export function NotificationsBell({
  workspaceId,
  tasks,
}: {
  workspaceId: string;
  tasks: OverdueTask[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`Tarefas atrasadas${tasks.length > 0 ? ` (${tasks.length})` : ""}`}
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground outline-none ring-offset-background transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Bell className="h-4 w-4" />
          {tasks.length > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {tasks.length > 9 ? "9+" : tasks.length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Tarefas atrasadas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tasks.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">Nenhuma tarefa atrasada.</p>
        ) : (
          tasks.map((task) => (
            <DropdownMenuItem key={task.id} asChild>
              <Link
                href={task.leadId ? `/${workspaceId}/leads/${task.leadId}` : `/${workspaceId}/pipeline`}
                className="flex flex-col items-start gap-0.5 whitespace-normal py-2"
              >
                <span className="text-sm font-medium text-foreground">{task.leadName}</span>
                <span className="line-clamp-2 text-xs text-muted-foreground">
                  {task.type} · {task.description}
                </span>
                <span className="text-xs text-destructive">
                  {new Date(task.scheduledAt).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
