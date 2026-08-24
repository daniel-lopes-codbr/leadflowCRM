"use client";

import Link from "next/link";
import { ChevronsUpDown, Plus, Workflow } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type WorkspaceOption = { id: string; name: string; logoUrl: string | null };

export function WorkspaceSwitcher({
  workspaceId,
  workspaces,
}: {
  workspaceId: string;
  workspaces: WorkspaceOption[];
}) {
  const current = workspaces.find((workspace) => workspace.id === workspaceId) ?? {
    id: workspaceId,
    name: workspaceId,
    logoUrl: null,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-left text-sm shadow-sm transition-colors hover:bg-secondary">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary text-primary-foreground">
            {current.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.logoUrl}
                alt={current.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Workflow className="h-4 w-4" strokeWidth={2.25} />
            )}
          </span>
          <span className="min-w-0 flex-1 truncate font-medium text-foreground">
            {current.name}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Seus workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((workspace) => (
          <DropdownMenuItem key={workspace.id} asChild>
            <Link href={`/${workspace.id}/dashboard`}>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded bg-secondary text-[11px] font-semibold text-secondary-foreground">
                {workspace.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={workspace.logoUrl}
                    alt={workspace.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  workspace.name.charAt(0).toUpperCase()
                )}
              </span>
              <span className="truncate">{workspace.name}</span>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/onboarding">
            <Plus className="h-4 w-4" />
            Criar novo workspace
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
