"use server";

import { redirect } from "next/navigation";
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

  redirect(`/${invite.workspace_id}/dashboard`);
}
