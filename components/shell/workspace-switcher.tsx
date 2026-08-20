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

const mockWorkspaces = [
  { id: "estudio-vertice", name: "Estúdio Vértice" },
  { id: "grao-torrefacao", name: "Grão Torrefação" },
] as const;

export function WorkspaceSwitcher({ workspaceId }: { workspaceId: string }) {
  const current = mockWorkspaces.find((workspace) => workspace.id === workspaceId) ?? {
    id: workspaceId,
    name: workspaceId,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-left text-sm shadow-sm transition-colors hover:bg-secondary">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Workflow className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <span className="flex-1 truncate font-medium text-foreground">{current.name}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Seus workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {mockWorkspaces.map((workspace) => (
          <DropdownMenuItem key={workspace.id} asChild>
            <Link href={`/${workspace.id}/dashboard`}>
              <span className="flex h-5 w-5 items-center justify-center rounded bg-secondary text-[11px] font-semibold text-secondary-foreground">
                {workspace.name.charAt(0)}
              </span>
              {workspace.name}
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
