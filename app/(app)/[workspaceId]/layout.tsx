import { redirect } from "next/navigation";
import { Navbar } from "@/components/shell/navbar";
import { Sidebar } from "@/components/shell/sidebar";
import { toOneRelation } from "@/lib/supabase/relations";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { workspaceId: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("workspace_id")
    .eq("workspace_id", params.workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    redirect("/onboarding");
  }

  const { data: workspaceRows } = await supabase
    .from("memberships")
    .select("workspace_id, workspaces(name, logo_url)")
    .eq("user_id", user.id);

  const workspaces = (workspaceRows ?? []).map((row) => {
    const workspace = toOneRelation(
      row.workspaces as
        | { name: string; logo_url: string | null }
        | { name: string; logo_url: string | null }[]
        | null
    );
    return {
      id: row.workspace_id as string,
      name: workspace?.name ?? (row.workspace_id as string),
      logoUrl: workspace?.logo_url ?? null,
    };
  });

  return (
    <div className="bg-secondary/30 flex h-screen overflow-hidden">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-background lg:flex">
        <Sidebar workspaceId={params.workspaceId} workspaces={workspaces} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar workspaceId={params.workspaceId} workspaces={workspaces} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
