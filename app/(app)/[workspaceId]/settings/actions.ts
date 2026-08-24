"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createResendClient, FROM_EMAIL } from "@/lib/resend/client";

const PLAN_MEMBER_LIMITS = { free: 1, pro: Infinity } as const;

export async function inviteMember(input: {
  workspaceId: string;
  email: string;
  role: "admin" | "member";
}): Promise<{ status: "success" | "error"; message: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, plan")
    .eq("id", input.workspaceId)
    .single();

  if (!workspace) {
    return { status: "error", message: "Workspace não encontrado." };
  }

  const { count: memberCount } = await supabase
    .from("memberships")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", input.workspaceId);

  const plan: "free" | "pro" = workspace.plan === "pro" ? "pro" : "free";
  const limit = PLAN_MEMBER_LIMITS[plan];
  if ((memberCount ?? 0) >= limit) {
    return {
      status: "error",
      message: `O plano ${plan === "free" ? "Free" : "Pro"} permite até ${limit} colaborador(es). Faça upgrade para convidar mais pessoas.`,
    };
  }

  const { data: invite, error: inviteError } = await supabase
    .from("invites")
    .upsert(
      {
        workspace_id: input.workspaceId,
        email: input.email,
        role: input.role,
        invited_by: user.id,
        accepted_at: null,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: "workspace_id,email" }
    )
    .select("token")
    .single();

  if (inviteError || !invite) {
    return { status: "error", message: "Não foi possível gerar o convite." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteUrl = `${appUrl}/signup?token=${invite.token}`;

  try {
    const resend = createResendClient();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: input.email,
      subject: `Você foi convidado para o workspace ${workspace.name} no LeadFlow CRM`,
      html: `<p>Você foi convidado para colaborar no workspace <strong>${workspace.name}</strong> no LeadFlow CRM.</p><p><a href="${inviteUrl}">Aceitar convite e criar sua conta</a></p>`,
    });
  } catch {
    return {
      status: "error",
      message:
        "Convite não pôde ser enviado (Resend não configurado). Peça para a pessoa acessar: " +
        inviteUrl,
    };
  }

  const admin = createAdminClient();
  await admin.from("audit_logs").insert({
    workspace_id: input.workspaceId,
    actor_id: user.id,
    event_type: "member.invited",
    metadata: { email: input.email, role: input.role },
  });

  return { status: "success", message: `Convite enviado para ${input.email}.` };
}
