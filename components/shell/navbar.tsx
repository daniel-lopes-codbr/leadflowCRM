import { Menu, Workflow } from "lucide-react";
import { Sidebar } from "@/components/shell/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { UserMenu } from "@/components/shell/user-menu";

export function Navbar({ workspaceId }: { workspaceId: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
      <div className="flex items-center gap-3 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
            <Sidebar workspaceId={workspaceId} />
          </SheetContent>
        </Sheet>
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Workflow className="h-4 w-4" strokeWidth={2.25} />
        </span>
      </div>

      <div className="flex-1" />

      <UserMenu workspaceId={workspaceId} />
    </header>
  );
}
