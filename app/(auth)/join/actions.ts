"use server";

import { redirect } from "next/navigation";
import { PLAN_LIMITS } from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function failWith(token: string, message: string): never {
  redirect(`/join?token=${token}&error=${encodeURIComponent(message)}`);
}

export async function acceptInvite(token: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/join?token=${token}`)}`);
  }

  const admin = createAdminClient();
  const { data: invite } = await admin
    .from("invites")
    .select("id, workspace_id, email, role, accepted_at, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!invite) failWith(token, "Convite inválido.");
  if (invite.accepted_at) failWith(token, "Este convite já foi utilizado.");
  if (new Date(invite.expires_at) < new Date()) failWith(token, "Este convite expirou.");
  if (invite.email.toLowerCase() !== user.email?.toLowerCase()) {
    failWith(
      token,
      `Este convite foi enviado para ${invite.email}, mas você está logado como ${user.email}.`
    );
  }

  const { data: workspace } = await admin
    .from("workspaces")
    .select("plan")
    .eq("id", invite.workspace_id)
    .single();

  const plan = workspace?.plan === "pro" ? "pro" : "free";
  const memberLimit = PLAN_LIMITS[plan].members;

  if (Number.isFinite(memberLimit)) {
    const { count: memberCount } = await admin
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", invite.workspace_id);

    if ((memberCount ?? 0) >= memberLimit) {
      failWith(
        token,
        `O plano ${plan === "free" ? "Free" : "Pro"} deste workspace já atingiu o limite de colaboradores.`
      );
    }
  }

  const { error: membershipError } = await admin
    .from("memberships")
    .upsert(
      { workspace_id: invite.workspace_id, user_id: user.id, role: invite.role },
      { onConflict: "workspace_id,user_id" }
    );

  if (membershipError) {
    failWith(token, "Não foi possível concluir o convite. Tente novamente.");
  }

  await admin.from("invites").update({ accepted_at: new Date().toISOString() }).eq("id", invite.id);

  await admin.from("audit_logs").insert({
    workspace_id: invite.workspace_id,
    actor_id: user.id,
    event_type: "member.joined",
    metadata: { email: invite.email, role: invite.role },
  });

  redirect(`/${invite.workspace_id}/dashboard`);
}
