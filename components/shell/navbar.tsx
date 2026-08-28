import { Workflow } from "lucide-react";
import { MobileNav } from "@/components/shell/mobile-nav";
import { NotificationsBell } from "@/components/shell/notifications-bell";
import { UserMenu } from "@/components/shell/user-menu";
import type { WorkspaceOption } from "@/components/shell/workspace-switcher";
import { toOneRelation } from "@/lib/supabase/relations";
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

  // Mesma lógica de escopo (responsável do lead) já usada no painel de
  // follow-ups do Dashboard — aqui só filtra pra atrasadas, por pedido
  // explícito do usuário ("sino com a quantidade de pendências em atraso").
  const { data: overdueRows } = await supabase
    .from("activities")
    .select("id, description, type, scheduled_at, lead_id, leads(name, owner_id)")
    .eq("workspace_id", workspaceId)
    .not("scheduled_at", "is", null)
    .is("completed_at", null)
    .is("canceled_at", null)
    .lt("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true });

  const overdueTasks = (overdueRows ?? [])
    .map((row) => {
      const lead = toOneRelation(
        row.leads as { name: string; owner_id: string | null } | { name: string; owner_id: string | null }[] | null
      );
      return {
        id: row.id,
        leadId: row.lead_id,
        leadName: lead?.name ?? "Sem lead vinculado",
        description: row.description,
        type: row.type,
        scheduledAt: row.scheduled_at!,
        ownerId: lead?.owner_id ?? null,
      };
    })
    .filter((task) => task.ownerId === user?.id);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
      <div className="flex items-center gap-3 lg:hidden">
        <MobileNav workspaceId={workspaceId} workspaces={workspaces} />
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Workflow className="h-4 w-4" strokeWidth={2.25} />
        </span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <NotificationsBell workspaceId={workspaceId} tasks={overdueTasks} />
        <UserMenu workspaceId={workspaceId} name={name} email={email} />
      </div>
    </header>
  );
}
