import { SettingsTabs } from "@/components/settings/settings-tabs";
import { toOneRelation } from "@/lib/supabase/relations";
import { createClient } from "@/lib/supabase/server";
import { startOfCurrentMonthIso, type WorkspacePlan } from "@/lib/plans";

export default async function SettingsPage(props: { params: Promise<{ workspaceId: string }> }) {
  const params = await props.params;
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: workspace }, { data: membershipRows }, { data: inviteRows }, { count: leadsCount }] =
    await Promise.all([
      supabase
        .from("workspaces")
        .select("id, name, logo_url, plan")
        .eq("id", params.workspaceId)
        .single(),
      supabase
        .from("memberships")
        .select("user_id, role, profiles(name, email)")
        .eq("workspace_id", params.workspaceId),
      supabase
        .from("invites")
        .select("id, email, role, expires_at")
        .eq("workspace_id", params.workspaceId)
        .is("accepted_at", null),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", params.workspaceId)
        .gte("created_at", startOfCurrentMonthIso()),
    ]);

  const members = (membershipRows ?? []).map((row) => {
    const profile = toOneRelation(
      row.profiles as { name: string; email: string } | { name: string; email: string }[] | null
    );
    return {
      userId: row.user_id as string,
      name: profile?.name ?? "Usuário",
      email: profile?.email ?? "",
      role: row.role as "admin" | "member",
    };
  });

  const pendingInvites = (inviteRows ?? []).map((row) => ({
    id: row.id as string,
    email: row.email as string,
    role: row.role as "admin" | "member",
    expiresAt: row.expires_at as string,
  }));

  const isAdmin = members.some((m) => m.userId === user?.id && m.role === "admin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie o workspace, sua equipe, o plano e a privacidade dos dados.
        </p>
      </div>
      <SettingsTabs
        workspaceId={params.workspaceId}
        workspace={{
          name: workspace?.name ?? "",
          logoUrl: workspace?.logo_url ?? null,
          plan: (workspace?.plan as WorkspacePlan) ?? "free",
        }}
        members={members}
        pendingInvites={pendingInvites}
        currentUserId={user?.id ?? ""}
        isAdmin={isAdmin}
        leadsUsed={leadsCount ?? 0}
      />
    </div>
  );
}
