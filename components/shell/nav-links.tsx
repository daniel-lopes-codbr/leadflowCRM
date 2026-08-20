"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Contact, KanbanSquare, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { segment: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { segment: "leads", label: "Leads", icon: Contact },
  { segment: "pipeline", label: "Pipeline", icon: KanbanSquare },
  { segment: "settings", label: "Configurações", icon: Settings },
] as const;

export function NavLinks({
  workspaceId,
  onNavigate,
}: {
  workspaceId: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const href = `/${workspaceId}/${item.segment}`;
        const isActive = pathname === href;
        return (
          <Link
            key={item.segment}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" strokeWidth={2} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
