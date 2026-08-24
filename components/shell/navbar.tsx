import { Workflow } from "lucide-react";
import { MobileNav } from "@/components/shell/mobile-nav";
import { UserMenu } from "@/components/shell/user-menu";
import type { WorkspaceOption } from "@/components/shell/workspace-switcher";
import { createClient } from "@/lib/supabase/server";

export async function Navbar({
  workspaceId,
  workspaces,
}: {
  workspaceId: string;
  workspaces: WorkspaceOption[];
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? "";
  const name = (user?.user_metadata?.name as string | undefined) || email.split("@")[0] || "Você";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
      <div className="flex items-center gap-3 lg:hidden">
        <MobileNav workspaceId={workspaceId} workspaces={workspaces} />
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Workflow className="h-4 w-4" strokeWidth={2.25} />
        </span>
      </div>

      <div className="flex-1" />

      <UserMenu workspaceId={workspaceId} name={name} email={email} />
    </header>
  );
}
